"""Zip each skills/<name>/ folder into dist/<name>.zip with no added files."""
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
DIST = ROOT / "dist"


def main():
    DIST.mkdir(exist_ok=True)
    for skill in sorted(p for p in SKILLS.iterdir() if (p / "SKILL.md").is_file()):
        out = DIST / f"{skill.name}.zip"
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(skill.rglob("*")):
                if f.is_file():
                    z.write(f, f.relative_to(skill).as_posix())
        print(f"{out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
