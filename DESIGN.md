---
name: RIZKI MOTOR
description: Professional motorcycle spare parts POS and catalog system
colors:
  primary: "#a78bfa"
  primary-deep: "#8b5cf6"
  primary-darker: "#7c3aed"
  surface-base: "#f4f4f5"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#fafafa"
  surface-container: "#ffffff"
  surface-container-high: "#a8a8ac"
  surface-outline: "#a1a1aa"
  surface-outline-variant: "#c8c8cc"
  text-primary: "#09090b"
  text-secondary: "#52525b"
  text-tertiary: "#a1a1aa"
  emerald: "#34d399"
  emerald-deep: "#10b981"
  red: "#ef4444"
  red-deep: "#dc2626"
  amber: "#f59e0b"
  amber-deep: "#d97706"
typography:
  display:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.red-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "16px"
  badge-success:
    backgroundColor: "rgba(52, 211, 153, 0.1)"
    textColor: "{colors.emerald}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-danger:
    backgroundColor: "rgba(239, 68, 68, 0.1)"
    textColor: "{colors.red}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-info:
    backgroundColor: "rgba(167, 139, 250, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: RIZKI MOTOR

## 1. Overview

**Creative North Star: "The Workshop Bench"**

A design system that feels like a well-organized workshop: everything in its place, nothing decorative, built to work under fluorescent lights during busy hours. The visual language is restrained and professional, prioritizing speed and clarity over ornament. Depth is conveyed through tonal layering (surface hierarchy), never through shadows or glass effects.

This system explicitly rejects busy enterprise POS aesthetics, SaaS marketing fluff inside operational screens, and legacy desktop chrome. Every pixel serves a purpose: identify, locate, act.

**Key Characteristics:**
- Flat-by-default surfaces with tonal layering for hierarchy
- Single accent (violet) used sparingly for primary actions and brand identity
- Geist type family with strong weight contrast for hierarchy
- Border-based card system with no box shadows
- Print-first receipt formatting for thermal printers

## 2. Colors

A restrained palette anchored by a single violet accent against clean neutral surfaces. The surface hierarchy uses tinted grays that adapt to light and dark themes via CSS custom properties.

### Primary
- **Soft Violet** (#a78bfa): Primary action color. Used on buttons, links, focus rings, active navigation states, and brand accent elements. Carries ~8-10% of surface area.
- **Deep Violet** (#8b5cf6): Hover state for primary elements. One step darker for interactive feedback.
- **Darker Violet** (#7c3aed): Active/pressed state. Used sparingly for momentary press feedback.

### Neutral
- **Surface Base** (#f4f4f5 light / #09090b dark): Page background. The resting canvas.
- **Surface Container** (#ffffff light / #18181b dark): Card and input backgrounds. Elevated surfaces sit here.
- **Surface Container Low** (#fafafa light / #0c0c0f dark): Slightly below container. Used for sidebar, header sub-panels.
- **Surface Container High** (#a8a8ac light / #1e1e22 dark): Hover states, skeleton pulses, secondary surfaces.
- **Text Primary** (#09090b light / #fafafa dark): Headings, body text, primary content.
- **Text Secondary** (#52525b light / #a1a1aa dark): Subtitles, descriptions, secondary labels.
- **Text Tertiary** (#a1a1aa light / #71717a dark): Muted metadata, timestamps, placeholder text.
- **Surface Outline** (#a1a1aa light / #3f3f46 dark): Borders, dividers, input strokes.
- **Surface Outline Variant** (#c8c8cc light / #27272a dark): Subtle borders, card edges.

### Semantic
- **Emerald** (#34d399): Success states, in-stock indicators, positive revenue, reseller pricing.
- **Red** (#ef4444): Error states, danger actions, out-of-stock, negative indicators.
- **Amber** (#f59e0b): Warnings, low stock alerts, pending states.

### Named Rules
**The One Accent Rule.** Violet is the only brand accent. It appears on primary buttons, active nav items, focus rings, and the brand logo. It never backgrounds entire sections or cards. Its rarity is what makes it meaningful.

**The Tonal Depth Rule.** Depth is conveyed through surface color shifts (base → container-low → container → container-high), not through shadows. Cards are flat. Hover states shift the surface, not lift the card.

## 3. Typography

**Display Font:** Geist (with system-ui fallback)
**Body Font:** Geist (with system-ui fallback)
**Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** A single geometric sans-serif family used across all roles. Hierarchy is conveyed through weight contrast (400 vs 600 vs 700) and size scale, not through font-family switching. The result is clean, modern, and consistent.

### Hierarchy
- **Display** (700, clamp(2.5rem, 5vw, 4rem), 1.1): Hero headings on public pages. Large, bold, tight.
- **Headline** (700, clamp(1.5rem, 3vw, 2rem), 1.2): Section headings on admin and POS pages.
- **Title** (600, 1.25rem, 1.3): Card titles, modal headers, subsection headings.
- **Body** (400, 0.875rem, 1.5): Form labels, descriptions, body copy. Max line length 65-75ch.
- **Label** (500, 0.75rem, 0.05em tracking): Button text, navigation items, compact UI labels.
- **Mono Eyebrow** (600, 0.625rem, 0.1em tracking, uppercase): Section eyebrows, table headers, metadata labels. Used sparingly.

### Named Rules
**The Weight Contrast Rule.** Hierarchy is always weight-contrast first (400 body vs 600 title vs 700 display), size second. Never rely on size alone; a small bold label reads as more important than a large regular-weight paragraph.

**The Mono Eyebrow Rule.** The monospaced uppercase eyebrow (e.g. "Produk", "Kategori") appears once per section maximum. It labels the section, it does not装饰 it. Two eyebrows on one page is one too many.

## 4. Elevation

This system is **flat by default**. No box shadows exist anywhere in the component library. Depth is conveyed entirely through tonal layering: the surface color hierarchy (base → container-low → container → container-high) creates visual separation between layers. Borders (1px solid surface-outline-variant) provide additional structure.

When elements need to appear elevated (dropdowns, modals, toasts), they use higher z-index tokens and the same flat surface treatment. The only "lift" comes from interactive state changes: hover shifts the surface color, focus adds a 2px violet ring, active state uses subtle transform scale.

### Named Rules
**The No-Shadow Rule.** Box shadows are forbidden on cards, buttons, inputs, and panels. Depth comes from surface color shifts and borders. The only exception is the optional focus ring (2px rgba violet glow) on interactive elements.

**The Border-as-Structure Rule.** Every card, input, and panel has a 1px border using surface-outline-variant. This provides structure without shadow. Borders are semantic: they separate surfaces, they don't decorate them.

## 5. Components

### Buttons
- **Shape:** Gently curved (8px radius), minimum height 36px (sm: 32px, md: 40px, lg: 48px).
- **Primary:** Soft violet background (#a78bfa), dark text (#09090b), 600 weight. Used for the single most important action per screen.
- **Hover:** Shifts to deeper violet (#8b5cf6). 150ms transition.
- **Focus:** 2px violet glow ring (rgba(167, 139, 250, 0.4)).
- **Secondary:** Transparent background, secondary text color, 1px border. For secondary actions.
- **Ghost:** Transparent background, tertiary text. For minimal-emphasis actions like icon buttons.
- **Danger:** Deep red background (#dc2626), white text. For destructive actions. Never used for errors in forms.
- **Active:** Subtle scale(0.97) transform on press. Provides tactile feedback.

### Inputs
- **Style:** 1px solid border (surface-outline-variant), white background (surface-container), 8px radius. Minimum height 40px.
- **Focus:** Border shifts to primary violet, 2px violet glow ring appears.
- **Error:** Border turns red (#ef4444), ring turns red at 20% opacity. Error message appears below in red with role="alert".
- **Label:** 10px uppercase mono eyebrow above the input. Required fields show a red asterisk.
- **Placeholder:** Uses text-tertiary color for adequate contrast.

### Cards
- **Corner Style:** Gently curved (8px radius).
- **Background:** Surface container (white in light, dark zinc in dark).
- **Shadow Strategy:** None. Flat by default. See Elevation section.
- **Border:** 1px solid surface-outline-variant.
- **Internal Padding:** 16px (p-4). Cards in dense contexts (POS) use 12px (p-3).
- **Hover:** Background shifts to surface-container-high. 150ms transition.

### Badges / Tags
- **Style:** Pill-shaped (9999px radius), 10px font, 500 weight. Background is the semantic color at 10% opacity with a 20% opacity border.
- **Success:** Emerald tint (#34d399 at 10%).
- **Danger:** Red tint (#ef4444 at 10%).
- **Info:** Violet tint (#a78bfa at 10%).
- **Warning:** Amber tint (#f59e0b at 10%).
- **Neutral:** Surface container high background with secondary text.

### Navigation
- **Public Header:** Sticky, translucent backdrop-blur, 56px height. Horizontal nav links with secondary text, primary on hover. Brand logo with violet icon.
- **Admin Sidebar:** Fixed left, 256px width, full-height. Active item has violet tint background with violet text. Collapsible on mobile with overlay backdrop.
- **POS Header:** Same sticky translucent pattern as public header. Compact nav with icon + text.
- **Mobile Nav:** Bottom-fixed navigation bar with icon-only items. Safe area padding for notch devices.

### Skeleton Loaders
- **Style:** Pulsing rectangles using surface-container-high background. Rounded to match the element they replace.
- **Animation:** CSS pulse animation (opacity 0.5 → 1 → 0.5). Respects prefers-reduced-motion.

### Toast Notifications
- **Style:** Fixed bottom-right, 16px radius, 1px border, backdrop-blur-sm. Slides in from right.
- **Success:** Emerald tint.
- **Error:** Red tint.
- **Info:** Violet tint.
- **Warning:** Amber tint.
- **Accessibility:** role="alert", aria-live="assertive". Dismiss button with clear label.

### Receipt (Thermal Printer)
- **Style:** Fixed-width containers for 58mm (56mm) and 80mm (76mm) thermal paper. Monospaced font. Print-only CSS rules strip UI chrome.

## 6. Do's and Don'ts

### Do:
- **Do** use the surface color hierarchy (base → container-low → container → container-high) to create depth instead of shadows.
- **Do** keep violet as the single accent color, used on primary buttons, active nav, and focus rings only.
- **Do** use 1px borders (surface-outline-variant) to define card and input edges.
- **Do** maintain 44px minimum touch targets on all interactive elements.
- **Do** use the mono eyebrow (uppercase, 0.1em tracking) once per section as a label, not as decoration.
- **Do** shift surface colors on hover instead of lifting cards with shadow or transform.
- **Do** keep receipts pixel-perfect for 58mm and 80mm thermal printers.
- **Do** use role="alert" and aria-live on all dynamic content (toasts, cart totals, stock changes).

### Don't:
- **Don't** use box shadows on cards, buttons, or panels. This is a flat-by-default system.
- **Don't** use gradient text (background-clip: text). Use solid text colors.
- **Don't** use glassmorphism (backdrop-blur on cards) decoratively. The header uses blur; cards do not.
- **Don't** put violet backgrounds on entire sections or cards. Violet is an accent, not a surface.
- **Don't** use side-stripe borders (border-left > 1px as colored accent). Use full borders or background tints.
- **Don't** use the hero-metric template (big number, small label, gradient accent). This is a POS, not a SaaS dashboard.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding. Numbers earn their place when order carries information.
- **Don't** over-round cards (24px+). Cards top out at 12px radius; full-pill is for badges and buttons only.
- **Don't** use busy enterprise POS aesthetics. No competing colors, cluttered dashboards, or overwhelming badge collections.
- **Don't** use em dashes. Use commas, colons, semicolons, periods, or parentheses.
