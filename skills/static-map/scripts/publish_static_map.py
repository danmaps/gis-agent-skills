"""Prepare or publish a read-only ArcGIS Pro map as a hosted vector tile layer.

Run this script from the ArcGIS Pro Python environment. Preparation is the
default. Publishing requires --execute and an existing ArcGIS Pro portal login.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Iterable


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path, help="Path to the APRX project")
    parser.add_argument("--map", dest="map_name", required=True, help="Map name in the project")
    parser.add_argument("--output", required=True, type=Path, help="Output .vtpk path")
    parser.add_argument("--summary", default="", help="Item summary")
    parser.add_argument("--tags", default="", help="Comma-separated item tags")
    parser.add_argument("--folder", default="", help="ArcGIS Online folder")
    parser.add_argument(
        "--sharing",
        choices=("owner", "organization", "public"),
        default="owner",
        help="Sharing level; owner is the safe default",
    )
    parser.add_argument(
        "--popup-field",
        action="append",
        default=[],
        dest="popup_fields",
        help="Field retained for simple identify; repeat as needed",
    )
    parser.add_argument("--min-scale", type=float, default=0, help="Minimum useful scale")
    parser.add_argument("--max-scale", type=float, default=0, help="Maximum useful scale")
    parser.add_argument("--replace-item-id", default="", help="Explicit existing item ID to replace")
    parser.add_argument("--execute", action="store_true", help="Create and publish the package")
    return parser.parse_args()


def require_arcpy():
    try:
        import arcpy
    except ImportError as exc:
        raise RuntimeError(
            "arcpy is unavailable. Run from the ArcGIS Pro Python environment."
        ) from exc
    return arcpy


def get_map(arcpy, project_path: Path, map_name: str):
    if not project_path.exists():
        raise FileNotFoundError(f"Project does not exist: {project_path}")
    project = arcpy.mp.ArcGISProject(str(project_path))
    maps = [candidate for candidate in project.listMaps() if candidate.name == map_name]
    if not maps:
        raise ValueError(f"Map not found in project: {map_name}")
    return project, maps[0]


def layer_summary(map_obj) -> dict[str, int]:
    layers = list(map_obj.listLayers())
    return {
        "layers": len(layers),
        "vector_layers": sum(1 for layer in layers if getattr(layer, "isFeatureLayer", False)),
        "raster_layers": sum(1 for layer in layers if getattr(layer, "isRasterLayer", False)),
    }


def preflight(map_obj, args: argparse.Namespace) -> dict:
    summary = layer_summary(map_obj)
    warnings: list[str] = []
    if summary["raster_layers"]:
        warnings.append("Raster layers require review and may not be supported by vector tile packaging.")
    if not args.popup_fields:
        interaction = "display only"
    elif len(args.popup_fields) <= 5:
        interaction = "simple identify"
    else:
        interaction = "simple identify with many popup fields"
        warnings.append("More than five popup fields were requested; reduce fields to minimize tile attributes.")
    if args.sharing != "owner":
        warnings.append(f"Sharing is explicitly set to {args.sharing}; verify the destination before execution.")
    if args.replace_item_id:
        warnings.append("Replacement mode is explicit; verify the item ID and production change window.")
    return {
        **summary,
        "interaction": interaction,
        "candidate": "VECTOR TILE",
        "warnings": warnings,
        "retained_popup_fields": list(args.popup_fields),
        "scale_range": {"minimum": args.min_scale, "maximum": args.max_scale},
    }


def print_preflight(project_path: Path, map_name: str, report: dict) -> None:
    print("STATIC MAP PREFLIGHT")
    print(f"Map: {map_name}")
    print(f"Layers: {report['layers']}")
    print(f"Vector layers: {report['vector_layers']}")
    print(f"Raster layers: {report['raster_layers']}")
    print(f"Interaction: {report['interaction']}")
    print(f"Candidate: {report['candidate']}")
    print(f"Source: {project_path}")
    print("Warnings:")
    if report["warnings"]:
        for warning in report["warnings"]:
            print(f"- {warning}")
    else:
        print("- None")
    print(f"Retained popup fields: {', '.join(report['retained_popup_fields']) or 'none'}")


def create_package(arcpy, map_obj, output_path: Path, args: argparse.Namespace) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.suffix.lower() != ".vtpk":
        raise ValueError("Output path must use the .vtpk extension.")
    kwargs = {
        "in_map": map_obj,
        "output_file": str(output_path),
        "tiling_scheme": "ONLINE",
    }
    if args.min_scale:
        kwargs["min_cached_scale"] = args.min_scale
    if args.max_scale:
        kwargs["max_cached_scale"] = args.max_scale
    arcpy.management.CreateVectorTilePackage(**kwargs)


def publish_package(arcpy, package_path: Path, args: argparse.Namespace) -> object:
    if args.sharing != "owner":
        # SharePackage uses the signed-in portal's sharing controls. The
        # explicit value remains in the receipt and must be applied by the
        # authenticated ArcGIS Pro workflow when required.
        arcpy.AddMessage(f"Requested sharing level: {args.sharing}")
    sharing_draft = arcpy.sharing.SharePackage(
        str(package_path),
        publish_web_layer=True,
        portal_folder=args.folder or None,
        summary=args.summary,
        tags=args.tags,
    )
    return sharing_draft


def main() -> int:
    args = parse_args()
    if args.replace_item_id and not args.execute:
        print("Replacement intent recorded; preparation does not modify the existing item.")
    if not args.execute:
        print(json.dumps(vars(args), indent=2, default=str))
        print("Preparation complete. Re-run with --execute from authenticated ArcGIS Pro to package and publish.")
        return 0

    arcpy = require_arcpy()
    project, map_obj = get_map(arcpy, args.project, args.map_name)
    report = preflight(map_obj, args)
    print_preflight(args.project, args.map_name, report)
    create_package(arcpy, map_obj, args.output, args)
    result = publish_package(arcpy, args.output, args)
    print("STATIC MAP PUBLISHED")
    print(f"Package: {args.output}")
    print("Associated feature layer: none")
    print(f"Share result: {result}")
    if args.replace_item_id:
        print(f"Replacement item requested: {args.replace_item_id}")
        print("Complete the ArcGIS Pro Replace Web Layer step to preserve the production item identity.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

