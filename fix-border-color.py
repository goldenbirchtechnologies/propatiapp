import re

files = [
    'src/app/dashboard/estate-manager/analytics/page.tsx',
    'src/app/dashboard/estate-manager/billing/EstateManagerBillingClient.tsx',
    'src/app/dashboard/estate-manager/bulk-import/page.tsx',
    'src/app/dashboard/estate-manager/financials/page.tsx',
    'src/app/dashboard/estate-manager/tenants/page.tsx',
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Replace borderColor: 'border-border'
    content = re.sub(
        r"style=\{\{\s*borderColor:\s*'border-border'\s*\}\}",
        'className="border-[#262626]"',
        content
    )
    
    # Replace borderColor: 'border-border', animation: '...'
    content = re.sub(
        r"style=\{\{\s*borderColor:\s*'border-border',\s*animation:\s*'([^']+)'\s*\}\}",
        r'className="border-[#262626]" style={{ animation: \'\1\' }}',
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Fixed: {filepath}')
    else:
        print(f'No changes: {filepath}')
