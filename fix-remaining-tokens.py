import os
import re

repo = "/home/r2d2c3p0/NEWPROPATI_new"
dashboard_dir = os.path.join(repo, "src/app/dashboard")

# Get all tsx files
result = os.popen(f"find {dashboard_dir} -type f -name '*.tsx'").read()
files = [f for f in result.strip().split("\n") if f.endswith(".tsx")]

# Comprehensive replacements for remaining old tokens
replacements = [
    # Notification colors
    ("bg-blue-500/10 text-neutral-300 border-blue-200", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-blue-500/10 text-blue-400 border-blue-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-yellow-500/10 text-yellow-400 border-yellow-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-green-500/10 text-green-400 border-green-500/20", "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20"),
    ("bg-red-500/10 text-red-400 border-red-500/20", "bg-red-500/10 text-red-500 border-red-500/20"),
    ("bg-sky-500/10 text-sky-400 border-sky-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-indigo-500/10 text-indigo-400 border-indigo-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-amber-500/10 text-amber-400 border-amber-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-zinc-500/10 text-zinc-400 border-zinc-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    ("bg-purple-500/10 text-purple-400 border-purple-500/20", "bg-[#262626] text-neutral-300 border-[#262626]"),
    
    # Solid color bars
    ("bg-blue-500/60", "bg-neutral-600/60"),
    ("bg-blue-500/5", "bg-neutral-700/5"),
    ("bg-blue-500/80", "bg-neutral-600/80"),
    ("bg-blue-500", "bg-neutral-600"),
    ("bg-purple-500", "bg-neutral-600"),
    ("text-blue-400", "text-neutral-300"),
    ("text-zinc-300", "text-neutral-300"),
    ("text-zinc-400", "text-neutral-400"),
    ("text-sky-400", "text-neutral-300"),
    ("text-indigo-400", "text-neutral-300"),
    ("text-amber-400", "text-neutral-300"),
    ("text-yellow-400", "text-neutral-300"),
    ("text-green-400", "text-[#00ff66]"),
    ("text-red-400", "text-red-500"),
    
    # Border/outline tokens
    ("border-outline", "border-[#262626]"),
    ("bg-outline/5", "bg-[#262626]/10"),
    ("border-border", "border-[#262626]"),
    ("hover:border-primary", "hover:border-white"),
    
    # Text tokens
    ("text-on-surface", "text-white"),
    ("text-on-tertiary-container", "text-[#00ff66]"),
    ("text-white-foreground", "text-white"),
    ("text-foreground", "text-white"),
    
    # Background tokens
    ("bg-surface-container-lowest", "bg-obsidian-800/30"),
    ("bg-surface-container-low", "bg-obsidian-800/30"),
    
    # Card patterns
    ('<Card className="p-6">', '<div className="glass-card rounded-xl p-6">'),
]

fixed = []
for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except Exception as e:
        continue
    
    original = content
    for pattern, replacement in replacements:
        content = content.replace(pattern, replacement)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        rel = filepath.replace(repo + "/", "")
        fixed.append(rel)

print(f"Fixed {len(fixed)} files in second pass:")
for f in fixed:
    print(f"  - {f}")

# Final check
print("\nFinal check for old tokens...")
old_tokens = [
    "text-primary", "text-on-surface-variant", "bg-surface-container-low[^e]",
    "bg-blue-50", "text-blue-700", "bg-success-bright", "text-success",
    "border-success-bright", "bg-destructive/10", "text-destructive",
    "border-destructive/20", "divide-outline-variant", "border-outline-variant",
    "bg-blue-500", "text-blue-", "border-blue-", "text-zinc-300", "text-zinc-400",
    "bg-outline/", "border-outline", "border-border", "hover:border-primary",
    "text-on-surface", "text-on-tertiary-container", "text-white-foreground",
    "text-foreground", "bg-surface-container-lowest", "bg-surface-container-low"
]

remaining = []
for f in files:
    try:
        with open(f, 'r') as fh:
            content = fh.read()
        for token in old_tokens:
            if token.startswith("bg-surface-container-low"):
                if re.search(token, content):
                    remaining.append(f.replace(repo + "/", ""))
                    break
            elif token in content:
                remaining.append(f.replace(repo + "/", ""))
                break
    except:
        pass

print(f"Files with remaining old tokens: {len(remaining)}")
for f in remaining[:30]:
    print(f"  - {f}")
