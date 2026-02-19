"""
Validate skill and pack integrity for gis-agent-skills.

Checks:
  1. Every skill folder has a SKILL.md
  2. Every SKILL.md has valid YAML frontmatter (name + description)
  3. Every SKILL.md contains required sections
  4. Every skill referenced in a pack exists on disk
  5. Every skill folder on disk is referenced in at least one pack
  6. No hardcoded credentials or suspicious secrets
"""

import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
PACKS_DIR = REPO_ROOT / "packs"

REQUIRED_SECTIONS = [
    "Intent",
    "Inputs",
    "Outputs",
    "Safety",
]

# Patterns that should never appear in skill files
SECRET_PATTERNS = [
    re.compile(r"password\s*[:=]\s*[\"'][^\"']+[\"']", re.IGNORECASE),
    re.compile(r"token\s*[:=]\s*[\"'][A-Za-z0-9_\-]{20,}[\"']", re.IGNORECASE),
    re.compile(r"AKIA[0-9A-Z]{16}"),  # AWS access key
    re.compile(r"sk-[A-Za-z0-9]{20,}"),  # OpenAI-style key
]

errors = []


def error(msg: str):
    errors.append(msg)
    print(f"  FAIL: {msg}")


def parse_frontmatter(text: str) -> dict | None:
    """Extract YAML frontmatter between --- delimiters."""
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None
    fm = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fm[key.strip()] = value.strip()
    return fm


def get_headings(text: str) -> list[str]:
    """Return all markdown heading texts (any level)."""
    return [m.group(1).strip() for m in re.finditer(r"^#{1,6}\s+(.+)", text, re.MULTILINE)]


def load_pack_skills(pack_path: Path) -> list[str]:
    """Parse skill refs from a pack YAML (simple line-based, no deps needed)."""
    skills = []
    in_skills = False
    for line in pack_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped == "skills:":
            in_skills = True
            continue
        if in_skills:
            if stripped.startswith("- "):
                skills.append(stripped[2:].strip())
            elif stripped and not stripped.startswith("#"):
                break
    return skills


# ── 1. Skill folder structure ──────────────────────────────────
print("Checking skill folders...")
skill_dirs = sorted(
    d for d in SKILLS_DIR.iterdir() if d.is_dir() and not d.name.startswith(".")
)

if not skill_dirs:
    error("No skill folders found in skills/")

for skill_dir in skill_dirs:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        error(f"{skill_dir.name}/ is missing SKILL.md")
        continue

    text = skill_md.read_text(encoding="utf-8")

    # ── 2. Frontmatter ─────────────────────────────────────────
    fm = parse_frontmatter(text)
    if fm is None:
        error(f"{skill_dir.name}/SKILL.md has no YAML frontmatter (---)")
    else:
        if not fm.get("name"):
            error(f"{skill_dir.name}/SKILL.md frontmatter missing 'name'")
        if not fm.get("description"):
            error(f"{skill_dir.name}/SKILL.md frontmatter missing 'description'")

    # ── 3. Required sections ───────────────────────────────────
    headings = get_headings(text)
    for section in REQUIRED_SECTIONS:
        # Allow partial matches like "⚠️ Credential Safety" matching "Safety"
        if not any(section.lower() in h.lower() for h in headings):
            error(f"{skill_dir.name}/SKILL.md missing required section: ## {section}")

    # ── 4. Secret detection ────────────────────────────────────
    for pattern in SECRET_PATTERNS:
        match = pattern.search(text)
        if match:
            error(f"{skill_dir.name}/SKILL.md may contain a secret: {match.group()[:40]}...")

# ── 5. Pack integrity ──────────────────────────────────────────
print("Checking packs...")
pack_files = sorted(PACKS_DIR.glob("*.yaml"))
if not pack_files:
    error("No pack files found in packs/")

all_pack_skill_refs = set()
skill_folder_names = {d.name for d in skill_dirs}

for pack_file in pack_files:
    refs = load_pack_skills(pack_file)
    if not refs:
        error(f"{pack_file.name} has no skills listed")

    for ref in refs:
        all_pack_skill_refs.add(ref)
        skill_path = REPO_ROOT / ref / "SKILL.md"
        if not skill_path.exists():
            error(f"{pack_file.name} references '{ref}' but {ref}/SKILL.md does not exist")

# ── 6. Orphan detection ───────────────────────────────────────
print("Checking for orphaned skills...")
referenced_names = {Path(ref).name for ref in all_pack_skill_refs}
for name in sorted(skill_folder_names - referenced_names):
    error(f"skills/{name}/ exists but is not referenced in any pack")

# ── Summary ────────────────────────────────────────────────────
print()
if errors:
    print(f"FAILED: {len(errors)} error(s) found")
    sys.exit(1)
else:
    print("ALL CHECKS PASSED")
    sys.exit(0)
