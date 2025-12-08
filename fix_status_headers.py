#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix dubbla STATUS headers och korrigera Last-coded-line värde.
"""
from pathlib import Path

def fix_status_headers(file_path: str):
    """Remove duplicate STATUS header and fix Last-coded-line value."""
    path = Path(file_path)

    print(f"📂 Läser fil: {path.name}")

    # Read file
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"📊 Totalt {len(lines)} rader före fix")

    # Find the two STATUS blocks
    # First STATUS: lines 0-9 (10 lines including ---)
    # Second STATUS: lines 10-20 (11 lines including extra --- separators)

    # Strategy: Keep first 10 lines but fix Last-coded-line value,
    # then skip lines 10-20, then keep rest

    fixed_lines = []

    for i, line in enumerate(lines):
        # Skip the duplicate STATUS block (lines 10-20)
        if 10 <= i <= 20:
            print(f"  Skippar rad {i+1}: {line.strip()[:50]}")
            continue

        # Fix Last-coded-line in first STATUS (around line 4-5)
        if i <= 9 and 'Last-coded-line: 2800' in line:
            fixed_line = line.replace('Last-coded-line: 2800', 'Last-coded-line: 0330')
            print(f"  Fixar rad {i+1}: '{line.strip()}' → '{fixed_line.strip()}'")
            fixed_lines.append(fixed_line)
            continue

        # Fix Next-segment in first STATUS
        if i <= 9 and 'Next-segment: 2801-1002' in line:
            fixed_line = line.replace('Next-segment: 2801-1002', 'Next-segment: 331-1002')
            print(f"  Fixar rad {i+1}: '{line.strip()}' → '{fixed_line.strip()}'")
            fixed_lines.append(fixed_line)
            continue

        # Keep all other lines
        fixed_lines.append(line)

    # Write back
    print(f"\n✏️  Skriver tillbaka fixad fil...")
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)

    print(f"\n✅ Klart!")
    print(f"   • Totalt rader före: {len(lines)}")
    print(f"   • Totalt rader efter: {len(fixed_lines)}")
    print(f"   • Rader borttagna: {len(lines) - len(fixed_lines)}")
    print(f"   • Last-coded-line: 2800 → 0330")
    print(f"   • Next-segment: 2801-1002 → 331-1002")

if __name__ == '__main__':
    file_path = '/Users/niklaskarlsson/Nextcloud/Fokusgrupper_AI_2025/Analysis/ULF_2025-12-07/Ai_fokusgrupp_ne_traff_1_rec_2.md'

    print("=" * 60)
    print("FIX DUBBLA STATUS HEADERS")
    print("=" * 60)
    print()

    fix_status_headers(file_path)

    print()
    print("🔍 Verifiera att STATUS nu är korrekt!")
    print("   - En STATUS header (inte två)")
    print("   - Last-coded-line: 0330")
    print("   - Next-segment: 331-1002")
