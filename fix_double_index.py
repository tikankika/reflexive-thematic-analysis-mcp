#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ta bort första index-nummer från filer med dubbla index.

Problemet: När add_line_index kördes på redan-kodad fil,
lades index till på ALLA rader, även koder och segment-markers.

Detta script tar bort de första 5 tecknen (DDDD + space) från alla
rader som börjar med 4 siffror.
"""
import re
from pathlib import Path


def remove_first_index(file_path: str):
    """Remove first 4-digit index from lines that have duplicate indices."""
    path = Path(file_path)

    print(f"📂 Läser fil: {path.name}")

    # Read file
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"📊 Totalt {len(lines)} rader")

    # Process lines
    fixed_lines = []
    removed_count = 0

    for i, line in enumerate(lines, 1):
        # Check if line starts with 4 digits + space
        if re.match(r'^\d{4}\s', line):
            # Remove first 5 characters (DDDD + space)
            fixed_line = line[5:]
            removed_count += 1

            # Show first few examples
            if removed_count <= 5:
                print(f"  Rad {i}: '{line[:20]}...' → '{fixed_line[:15]}...'")
        else:
            fixed_line = line

        fixed_lines.append(fixed_line)

    # Write back
    print(f"\n✏️  Skriver tillbaka fixad fil...")
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)

    print(f"\n✅ Klart!")
    print(f"   • Totalt rader: {len(lines)}")
    print(f"   • Rader fixade: {removed_count}")
    print(f"   • Rader oförändrade: {len(lines) - removed_count}")


if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        print("Usage: python fix_double_index.py <file_path>")
        sys.exit(1)
    file_path = sys.argv[1]

    print("=" * 60)
    print("FIX DUBBLA INDEX-NUMMER")
    print("=" * 60)
    print()

    remove_first_index(file_path)

    print()
    print("🔍 Verifiera att filen ser korrekt ut nu!")
    print("   Kolla några rader för att se att index är borta från:")
    print("   - Kod-rader (ska inte ha index)")
    print("   - Segment-markers (/segment, /slut_segment)")
    print("   - Men BIBEHÅLLS på content-rader")
