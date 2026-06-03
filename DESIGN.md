# Obsidian — High-Contrast Dark

## North Star: "Precision in Darkness"
Developer-grade dark UI. Near-black surfaces, high-contrast text, and precise accent colors. Clean, fast-feeling, and functional.

## Design Philosophy
- **Dark-only**: Forced dark mode via `<html className="dark">`. No light mode.
- **Borders over shadows**: Separation via `1px solid #27272a` borders. Zero shadow usage.
- **Accent for function, not decoration**: Color only conveys meaning (primary=interactive, emerald=success, red=error).
- **Accessibility**: WCAG AA contrast minimum (4.5:1) for all text. Skip links, focus rings, aria-labels, keyboard nav throughout.

## Colors
- **Primary (`#a78bfa`)**: Soft violet — interactive elements, links, focus rings, active states.
- **Background (`#09090b`)**: True near-black.
- **Surface scale**: Zinc-based grays (`#0c0c0f` → `#27272a`). Very subtle increments.
  - `surface-base`: `#09090b` (body bg)
  - `surface-container-low`: `#0c0c0f` (dark cards)
  - `surface-container`: `#18181b` (cards)
  - `surface-container-high`: `#1e1e22` (hover states)
  - `surface-container-highest`: `#27272a` (active/outline variant)
- **Emerald (`#34d399`)**: Success states, positive indicators.
- **Red (`#ef4444`)**: Errors, destructive actions only (no decorative use).
- **Amber (`#f59e0b`)**: Warnings, low stock indicators.

## Typography
- **Font family**: Geist (sans-serif), Geist Mono (monospace).
- **Headings**: Letter-spacing `-0.02em`, bold (600-700 weight).
- **Body**: Standard spacing, `#fafafa` for primary text, `#a1a1aa` for secondary.
- **Minimum body size**: 12px (captions), 14px (body), 16px (large screens).

## Elevation & Surfaces
- **No shadows** — separation via `1px solid #27272a` borders.
- **Card hover**: Background shifts to next surface tier.
- **Active state**: Primary/10 background for active navigation, Primary/20 for focus ring.
- **Focus rings**: `2px solid #a78bfa` with `2px offset`.

## Spacing System
- **8dp rhythm**: 4/8/12/16/24/32/48 spacing increments.
- **Section spacing**: `py-8 lg:py-12` (32px → 48px).
- **Card padding**: `p-4` to `p-6` (16px → 24px).
- **Safe areas**: `env(safe-area-inset-bottom)` for notch/gesture bar clearance.

## Component Principles

### Buttons
- **Primary**: Solid violet fill (`bg-primary text-surface-base`).
- **Secondary**: Transparent + border (`border-surface-outline-variant`).
- **Danger**: Red fill for destructive actions.
- **Ghost**: Text only, visible on hover.
- All buttons: `min-h-[36px]` minimum, `active:scale-[0.97]` press feedback, `disabled:opacity-30`.

### Cards
- `bg-surface-container`, `border-surface-outline-variant`, `rounded-lg`.
- Hover → `bg-surface-container-high`.

### Inputs & Forms
- `bg-surface-container`, `border-surface-outline-variant`, `focus:border-primary focus:ring-2`.
- Error state: `!border-red-500 !ring-red-500/20`.
- Labels: 12px uppercase tracking-wider, `text-zinc-400`.
- Hints: 11px `text-zinc-500`.
- All inputs use `aria-invalid`, `aria-describedby` for accessibility.
- `useId()` for unique label/input associations.

### Badges
- Success: Emerald tint.
- Warning: Amber tint.
- Danger: Red tint.
- Info: Primary tint.
- Neutral: Zinc tint.

### Navigation
- **Mobile bottom nav**: 5 items max, 48px height, active state with color change.
- **Desktop sidebar**: Fixed 256px, border-separated, active item highlighted.
- **Public nav**: Sticky header + bottom mobile nav, 4 items + optional panel link.

### Modals & Drawers
- Overlay: `bg-black/60 backdrop-blur-sm`.
- Transitions: `duration-200 ease-out`.

## Accessibility Features
- Skip-to-content link (keyboard-first).
- Focus rings on all interactive elements (`focus:ring-2 focus:ring-primary/40`).
- Semantic HTML: `nav`, `main`, `section[aria-label]`, `aside`, `header`, `footer`.
- `aria-current="page"` on active navigation items.
- `aria-label` on icon-only buttons.
- `aria-invalid` + `aria-describedby` on form inputs.
- `role="alert"` on error messages.
- `role="radiogroup"` on radio button groups.
- `prefers-reduced-motion` respected globally.

## Performance
- CSS `@import` for Geist fonts (via Google Fonts CDN).
- Lazy loading for images (`loading="lazy"`).
- Google Maps iframe: `loading="lazy"`.
- No layout-shifting animations (transform/opacity only).
- Scrollbar customization reduces repaint cost.

## Animations
- **fade-in**: 0.3s ease-out (content entrance).
- **slide-up**: 0.25s ease-out (mobile menu).
- **scale-in**: 0.15s ease-out (modals).
- **pulse-subtle**: 2s (loading indicators).
- **Stagger**: 8 items max, 40ms delay increments.
- Press feedback: `active:scale-[0.97]` on buttons, `active:scale-[0.98]` on cards.
- Respects `prefers-reduced-motion`: all animations → 0.01ms.

## Key Improvements (v2)
- Fixed color token consistency across all UI components (removed old `brand-*`/`surface-*` token leakage).
- Fixed light-mode color references in dark-only theme (Select had `bg-white`, AdminLayout had `bg-surface-50`, StrukView had light classes).
- Added `useId()` in form components for accessible label/input linking.
- Added `aria-describedby` linking to error/hint messages.
- Added `aria-current="page"` to all navigation active states.
- Added `safe-area-bottom` and `safe-area-top` utilities for devices with notches.
- Enhanced `skip-link` with smooth translation animation.
- Added shimmer loading utility for skeleton states.
- Added `slide-in-right`/`slide-out-right` animations for drawer transitions.
- Unified `StatusBadge` to use global badge class system with Indonesian labels.
- Added form validation with field-level errors in `ProductForm`.
- Increased touch targets to minimum 44px throughout.
- Fixed `active:scale` press feedback across all interactive elements.
