# 13 – Responsive System

## 1. Breakpoints

| Name | Min Width | Max Width | Usage |
|------|-----------|-----------|-------|
| sm | 640px | 767px | Large phone / small tablet |
| md | 768px | 1023px | Tablet |
| lg | 1024px | 1279px | Laptop |
| xl | 1280px | — | Desktop |

## 2. Layout Behavior

- Sidebar: persistent on `lg+`, drawer on `md` and below
- Modals: centered dialog on `lg+`, bottom sheet on `md` and below
- Tables: card layout on mobile, table layout on `md+`
- Grids: 3-col → 2-col @ 768px → 1-col @ 480px

## 3. Touch Targets

- Minimum 44x44px on all interactive elements
- Buttons, nav items, inputs sized accordingly

## 4. Typography Scaling

- `text-base` (16px) minimum on body
- Scale up to `text-2xl` for headings
- Line height 1.5 for body, 1.2 for headings

## 5. Images

- Responsive Cloudinary transforms: `f_auto,q_auto,w_800`
- Lazy loading on all below-fold images
- Aspect ratio boxes to prevent layout shift

## 6. Testing

- iPhone SE (375px), iPhone 14 Pro (393px), iPad (768px), Desktop (1920px)
- Chrome DevTools device emulation
- Real device QA on critical journeys
