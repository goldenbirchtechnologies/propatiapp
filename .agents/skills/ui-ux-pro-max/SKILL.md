---
name: ui-ux-pro-max
description: "AI-powered design intelligence with 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types. Triggers: UI design, styling, layout, visual aesthetics, color schemes, typography, accessibility, mobile-first layouts, animations."
metadata:
  author: NextLevelBuilder
  version: "2.5.0"
---

# UI/UX Pro Max

AI-powered design intelligence with 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 15+ tech stacks.

## References

- [Full Quick Reference Guide](file:///mnt/c/Users/USER/Documents/NEWPROPATI/.agents/skills/ui-ux-pro-max/references/quick-reference.md)

## How to Use This Skill

Use this skill when the user requests any of the following:

| Scenario | Trigger Examples | Start From |
|----------|-----------------|------------|
| **New project / page** | "做一个 landing page", "Build a dashboard" | Step 1 → Step 2 (design system) |
| **New component** | "Create a pricing card", "Add a modal" | Step 3 (domain search: style, ux) |
| **Choose style / color / font** | "What style fits a fintech app?", "推荐配色" | Step 2 (design system) |
| **Review existing UI** | "Review this page for UX issues", "检查无障碍" | Quick Reference checklist |
| **Fix a UI bug** | "Button hover is broken", "Layout shifts on load" | Quick Reference → relevant section |
| **Improve / optimize** | "Make this faster", "Improve mobile experience" | Step 3 (domain search: ux, react) |
| **Implement dark mode** | "Add dark mode support" | Step 3 (domain: style "dark mode") |
| **Add charts / data viz** | "Add an analytics dashboard chart" | Step 3 (domain: chart) |
| **Stack best practices** | "React performance tips", "Next.js routing" | Step 4 (stack search) |

Follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: Marketplace, SaaS, Admin console, Dashboard.
- **Target audience**: Consumer, B2B, landlords, tenants, agents.
- **Style keywords**: Modern, minimal, clean, dark mode, high contrast, vibrant.
- **Stack**: Next.js 14 App Router, Tailwind CSS, shadcn/ui.

### Step 2: Generate Design System

**Always start with `--design-system`** to get comprehensive recommendations with reasoning from the global skill directory `/mnt/c/Users/USER/.claude/skills/ui-ux-pro-max`:

```bash
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

**Example:**
```bash
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "real estate verified marketplace mobile-friendly" --design-system -p "PROPATI"
```

### Step 3: Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Need | Domain | Example |
|------|--------|---------|
| Product type patterns | `product` | `--domain product "marketplace"` |
| More style options | `style` | `--domain style "minimalism dark"` |
| Color palettes | `color` | `--domain color "real-estate"` |
| Font pairings | `typography` | `--domain typography "modern elegant"` |
| Chart recommendations | `chart` | `--domain chart "analytics dashboard"` |
| UX best practices | `ux` | `--domain ux "accessibility touch"` |
| Landing structure | `landing` | `--domain landing "hero search"` |

### Step 4: Next.js Stack Guidelines

Get Next.js implementation-specific best practices:

```bash
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "performance" --stack nextjs
```

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "marketplace" --design-system

# Markdown - best for documentation
python3 /mnt/c/Users/USER/.claude/skills/ui-ux-pro-max/scripts/search.py "marketplace" --design-system -f markdown
```
