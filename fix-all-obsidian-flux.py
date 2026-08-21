import os
import re
import subprocess

repo = "/home/r2d2c3p0/NEWPROPATI_new"
dashboard_dir = os.path.join(repo, "src/app/dashboard")

replacements = [
    # Text colors
    ("text-primary", "text-white"),
    ("text-on-surface-variant", "text-neutral-400"),
    ("text-success", "text-[#00ff66]"),
    ("text-destructive", "text-red-500"),
    ("text-blue-700", "text-neutral-300"),
    
    # Background colors
    (r"bg-surface-container-low(?!est)", "bg-surface-container-lowest"),
    (r"bg-blue-50(?!\d)", "bg-[#262626]"),
    ("bg-success-bright/10", "bg-[#00ff66]/10"),
    ("bg-destructive/10", "bg-red-500/10"),
    
    # Border colors
    ("border-success-bright/20", "border-[#00ff66]/20"),
    ("border-destructive/20", "border-red-500/20"),
    ("divide-outline-variant", "divide-[#262626]"),
    ("border-outline-variant", "border-[#262626]"),
    ("border-surface ", "border-[#262626] "),
    ("border-surface\"", "border-[#262626]\""),
    ("border-surface'>", "border-[#262626]'>"),
    
    # Hover states
    ("hover:bg-surface-container", "hover:bg-obsidian-800"),
    ("hover:bg-surface-container/", "hover:bg-obsidian-800/"),
    
    # Badge patterns
    (r"bg-destructive/10 text-destructive border-destructive/20", "bg-red-500/10 text-red-500 border-red-500/20"),
    (r"bg-success-bright/10 text-success border-success-bright/20", "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20"),
    (r"bg-blue-50 text-blue-700 border-blue-200", "bg-[#262626] text-neutral-300 border-[#262626]"),
    
    # Invalid patterns
    ("text-neutral-400-foreground", "text-neutral-400"),
    
    # Card wrapper patterns
    (r'<Card className="p-6">', '<div className="glass-card rounded-xl p-6">'),
    (r'</Card>', '</div>'),
]

# Get all tsx files
result = subprocess.run(["find", dashboard_dir, "-type", "f", "-name", "*.tsx"], 
                       capture_output=True, text=True, cwd=repo)
files = [f for f in result.stdout.strip().split("\n") if f.endswith(".tsx")]

fixed = []
for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        continue
    
    original = content
    for pattern, replacement in replacements:
        if pattern.startswith("r\"") or pattern.startswith("r'"):
            # Regex pattern
            content = re.sub(pattern[2:-1], replacement, content)
        else:
            content = content.replace(pattern, replacement)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        rel = filepath.replace(repo + "/", "")
        fixed.append(rel)

print(f"Fixed {len(fixed)} files:")
for f in fixed:
    print(f"  - {f}")
