import re
import glob

ROOT = '/home/r2d2c3p0/NEWPROPATI_new'

files = glob.glob('src/app/dashboard/**/*.tsx', recursive=True) + \
        glob.glob('src/app/dashboard/**/*.ts', recursive=True) + \
        glob.glob('src/app/dashboard/**/*.jsx', recursive=True) + \
        glob.glob('src/app/dashboard/**/*.js', recursive=True)

fixes = 0
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix double className patterns
    # Pattern: className="..." className="border-[#262626]" 
    content = re.sub(
        r'className="([^"]*)"\s+className="border-\[#262626\]"',
        r'className="\1 border-[#262626]"',
        content
    )
    
    # Pattern with escaped quotes (from previous bad replacement)
    content = re.sub(
        r'className=\\"([^"]*)\\"\s+className=\\"border-\[#262626\]\\"',
        r'className="\1 border-[#262626]"',
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        fixes += content.count('border-[#262626]') - original.count('border-[#262626]')
        print(f'Fixed double className: {filepath}')

print(f'\nTotal fixes: {fixes}')
