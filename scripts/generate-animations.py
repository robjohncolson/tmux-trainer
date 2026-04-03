#!/usr/bin/env python3
"""
generate-animations.py

Batch-generate Manim animation scripts for all 66 AP Stats formulas
using the Math-To-Manim six-agent pipeline.

Usage:
  python scripts/generate-animations.py                    # generate all
  python scripts/generate-animations.py --domain descriptive  # one domain
  python scripts/generate-animations.py --id mean zscore   # specific IDs
  python scripts/generate-animations.py --dry-run          # preview prompts

Requires:
  - Math-To-Manim repo at ../Math-To-Manim (or set MATH_TO_MANIM_PATH)
  - ANTHROPIC_API_KEY environment variable
"""

import json
import sys
import os
import argparse
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
MANIFEST_PATH = SCRIPT_DIR / "animation-manifest.json"
OUTPUT_DIR = PROJECT_DIR / "animations" / "output"
MATH_TO_MANIM = Path(os.environ.get(
    "MATH_TO_MANIM_PATH",
    str(PROJECT_DIR.parent / "Math-To-Manim")
))


def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def filter_entries(entries, domain=None, ids=None):
    if ids:
        id_set = set(ids)
        return [e for e in entries if e["id"] in id_set]
    if domain:
        return [e for e in entries if e["domain"] == domain]
    return entries


def generate_one(entry, dry_run=False):
    """Generate a Manim animation script for a single formula."""
    cmd_id = entry["id"]
    out_dir = OUTPUT_DIR / cmd_id
    out_dir.mkdir(parents=True, exist_ok=True)

    prompt = entry["prompt"]

    if dry_run:
        print(f"[DRY RUN] {cmd_id}: {prompt[:100]}...")
        return True

    print(f"\n{'='*60}")
    print(f"Generating: {cmd_id} — {entry['name']}")
    print(f"{'='*60}")

    # Write prompt to file for reference
    (out_dir / "prompt.txt").write_text(prompt, encoding="utf-8")

    # Try pipeline via orchestrator
    orchestrator_script = MATH_TO_MANIM / "src" / "agents" / "orchestrator.py"
    if not orchestrator_script.exists():
        print(f"  ERROR: Math-To-Manim orchestrator not found at {orchestrator_script}")
        return False

    try:
        result = subprocess.run(
            [
                sys.executable, "-c",
                f"""
import sys
sys.path.insert(0, {str(MATH_TO_MANIM)!r})
from src.agents.orchestrator import ReverseKnowledgeTreeOrchestrator

orchestrator = ReverseKnowledgeTreeOrchestrator(
    max_tree_depth=2,
    enable_code_generation=True,
    enable_threejs_generation=False,
)
result = orchestrator.process(
    user_input={prompt!r},
    output_dir={str(out_dir)!r}
)
print("SUCCESS" if result.manim_code else "NO_CODE")
"""
            ],
            capture_output=True, text=True, timeout=600,
            cwd=str(MATH_TO_MANIM)
        )

        if "SUCCESS" in result.stdout:
            print(f"  OK: Generated Manim script for {cmd_id}")
            return True
        else:
            print(f"  WARN: Pipeline completed but no code for {cmd_id}")
            print(f"  stdout: {result.stdout[-500:]}")
            print(f"  stderr: {result.stderr[-500:]}")
            return False

    except subprocess.TimeoutExpired:
        print(f"  TIMEOUT: {cmd_id} exceeded 10 minute limit")
        return False
    except Exception as e:
        print(f"  ERROR: {cmd_id}: {e}")
        return False


def render_one(cmd_id):
    """Render a generated Manim script to MP4."""
    out_dir = OUTPUT_DIR / cmd_id
    # Find the animation .py file
    py_files = list(out_dir.glob("*_animation.py")) + list(out_dir.glob("*.py"))
    py_files = [f for f in py_files if f.name != "prompt.txt"]

    if not py_files:
        print(f"  No .py file found for {cmd_id}")
        return None

    script = py_files[0]

    # Extract scene class name
    import re
    content = script.read_text(encoding="utf-8")
    classes = re.findall(r"class\s+(\w+)\s*\(\s*\w*Scene\s*\)", content)
    if not classes:
        print(f"  No Scene class found in {script.name}")
        return None

    scene_class = classes[-1]  # Use last (usually the main scene)
    output_file = out_dir / f"{cmd_id}.mp4"

    try:
        result = subprocess.run(
            [
                "manim", "render", "-qm",  # medium quality (720p30)
                "--format", "mp4",
                "-o", str(output_file),
                str(script), scene_class
            ],
            capture_output=True, text=True, timeout=300
        )
        if output_file.exists():
            size_kb = output_file.stat().st_size / 1024
            print(f"  Rendered: {cmd_id}.mp4 ({size_kb:.0f} KB)")
            return str(output_file)
        else:
            print(f"  Render failed for {cmd_id}")
            print(f"  stderr: {result.stderr[-500:]}")
            return None
    except Exception as e:
        print(f"  Render error: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Generate Manim animations for AP Stats formulas")
    parser.add_argument("--domain", help="Filter by domain (e.g., descriptive, probability)")
    parser.add_argument("--id", nargs="+", help="Specific command IDs to generate")
    parser.add_argument("--dry-run", action="store_true", help="Preview prompts without generating")
    parser.add_argument("--render", action="store_true", help="Also render generated scripts to MP4")
    parser.add_argument("--render-only", action="store_true", help="Only render existing scripts (skip generation)")
    args = parser.parse_args()

    manifest = load_manifest()
    entries = filter_entries(manifest, domain=args.domain, ids=args.id)

    print(f"Animation manifest: {len(manifest)} total, {len(entries)} selected")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Math-To-Manim path: {MATH_TO_MANIM}")
    print()

    if args.render_only:
        rendered = 0
        for entry in entries:
            mp4 = render_one(entry["id"])
            if mp4:
                rendered += 1
        print(f"\nRendered: {rendered}/{len(entries)}")
        return

    generated = 0
    rendered = 0
    for entry in entries:
        ok = generate_one(entry, dry_run=args.dry_run)
        if ok:
            generated += 1
        if ok and args.render and not args.dry_run:
            mp4 = render_one(entry["id"])
            if mp4:
                rendered += 1

    print(f"\nGenerated: {generated}/{len(entries)}")
    if args.render:
        print(f"Rendered: {rendered}/{len(entries)}")


if __name__ == "__main__":
    main()
