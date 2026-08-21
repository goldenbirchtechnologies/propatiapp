import re
import os
import glob

ROOT = '/home/r2d2c3p0/NEWPROPATI_new'

# Files that were broken by the previous script
broken_files = glob.glob('src/app/dashboard/**/*.tsx', recursive=True) + \
               glob.glob('src/app/dashboard/**/*.ts', recursive=True) + \
               glob.glob('src/app/dashboard/**/*.jsx', recursive=True) + \
               glob.glob('src/app/dashboard/**/*.js', recursive=True)

# Fix broken style patterns
fixes = 0

for filepath in broken_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix: style={{ className="border-[#262626]", ... }} back to correct form
    # Pattern 1: style={{ className="border-[#262626]", animation: '...' }}
    content = re.sub(
        r"style=\{\{\s*className=\"border-\[#262626\]\",\s*animation:\s*'([^']+)'\s*\}\}",
        r"className=\"border-[#262626]\" style={{ animation: '\1' }}",
        content
    )
    
    # Pattern 2: style={{ className="border-[#262626]", color: 'text-neutral-400' }}
    content = re.sub(
        r"style=\{\{\s*className=\"border-\[#262626\]\",\s*color:\s*'text-neutral-400'\s*\}\}",
        r"className=\"border-[#262626] text-neutral-400\"",
        content
    )
    
    # Pattern 3: style={{ className="border-[#262626]" }}
    content = re.sub(
        r"style=\{\{\s*className=\"border-\[#262626\]\"\s*\}\}",
        r"className=\"border-[#262626]\"",
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        fixes += len(re.findall(r"style=\{\{\s*className=\"border-\[#262626\]\"", original))
        print(f"Fixed: {filepath}")

print(f"\nTotal broken patterns fixed: {fixes}")

# Now handle remaining old tokens
token_replacements = [
    (r'\btext-primary\b', 'text-white'),
    (r'\btext-on-surface-variant\b', 'text-neutral-400'),
    (r'\bbg-surface-container-low\b', 'bg-surface-container-lowest'),
    (r'\bbg-blue-50\b', 'bg-[#262626]'),
    (r'\bbg-success-bright/10\b', 'bg-[#00ff66]/10'),
    (r'\bbg-destructive/10\b', 'bg-red-500/10'),
    (r'\bborder-success-bright/20\b', 'border-[#00ff66]/20'),
    (r'\bborder-destructive/20\b', 'border-red-500/20'),
    (r'\bdivide-outline-variant\b', 'divide-[#262626]'),
    (r'\bborder-outline-variant\b', 'border-[#262626]'),
    (r'\bborder-surface\b', 'border-[#262626]'),
    (r'\bbg-surface-container-low/60\b', 'bg-obsidian-800/60'),
    (r'\bhover:bg-surface-container\b', 'hover:bg-obsidian-800'),
    (r'\btext-neutral-400-foreground\b', 'text-neutral-400'),
    (r'\btext-success\b', 'text-[#00ff66]'),
    (r'\btext-destructive\b', 'text-red-500'),
    (r'\bborder-success-bright\b', 'border-[#00ff66]'),
    (r'\bborder-destructive\b', 'border-red-500'),
]

# Also fix borderColor inline styles that remain
border_color_fixes = [
    (r"style=\{\{\s*borderColor:\s*'border-\[#262626\]'\s*\}\}", 'className="border-[#262626]"'),
    (r"style=\{\{\s*borderColor:\s*'border-\[#262626\]',\s*animation:\s*'([^']+)'\s*\}\}", r'className="border-[#262626]" style={{ animation: \'\1\' }}'),
]

remaining_changes = 0
remaining_files = []

for filepath in broken_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    file_changes = 0
    
    # Token replacements
    for old_tok, new_tok in token_replacements:
        matches = re.findall(old_tok, content)
        if matches:
            content = re.sub(old_tok, new_tok, content)
            file_changes += len(matches)
    
    # borderColor fixes
    for old_pat, new_pat in border_color_fixes:
        matches = re.findall(old_pat, content)
        if matches:
            content = re.sub(old_pat, new_pat, content)
            file_changes += len(matches)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        remaining_changes += file_changes
        remaining_files.append(filepath)
        print(f"Updated: {filepath} ({file_changes} changes)")

print(f"\nTotal remaining files updated: {len(remaining_files)}")
print(f"Total remaining changes: {remaining_changes}")
