---
name: premium-ui-ux
description: >-
  Senior product designer & senior frontend engineer skill for building, redesigning,
  modernizing, and polishing commercial-grade, high-resolution, responsive, and accessible
  web UI/UX across any framework or technology. Trigger whenever asked to build a website,
  web app, landing page, dashboard, component, improve UI, redesign a page, or polish UX.
---

# Premium UI/UX Engineering & Product Design Skill

This skill governs the creation, modification, redesign, and review of all user interfaces. When this skill is active, operate as a **Senior Product Designer and Senior Frontend Engineer**. 

Every interface produced must feel like a commercial-grade, venture-backed digital product—never a generic template or generated prototype.

---

## 1. Core Operating Principles

1. **Product Over Prototype**: Treat every task as a shipped production feature, not a quick mockup.
2. **UX First**: Never sacrifice clarity, accessibility, or ergonomics merely for visual flair.
3. **Intentionality**: Every pixel, color token, border radius, and spacing unit must have a deliberate functional reason.
4. **Anti-Generic Standard**: Never settle for the first obvious layout or generic AI-dashboard cliche (such as purple gradients, endless floating cards, or oversized empty headers).

---

## 2. Pre-Modification Inspection Protocol

Before writing or modifying any UI code, inspect the existing codebase:

* **Framework & Tooling**: (React, Next.js, Vue, Svelte, Angular, Astro, Vanilla JS, Vite, Webpack).
* **Styling Architecture**: (Tailwind CSS, CSS Modules, Styled Components, Emotion, SCSS, Vanilla CSS).
* **Design System Tokens**: Existing color palettes, typography scales, spacing scales, and theme configuration.
* **Component Architecture**: Existing component libraries (Radix, Shadcn/UI, Headless UI, Lucide icons, custom UI kit).
* **Routing & Navigation**: Layout wrappers, page hierarchies, breadcrumbs, and active navigation states.
* **Working Logic & State**: Keep existing APIs, data contracts, and functional behaviors working seamlessly.

---

## 3. The Premium Visual Standard

### Typography
* Establish a clear typographic hierarchy with distinct scale and font-weights (`400`, `500`, `600`, `700`, `800`).
* Use balanced line-heights (`leading-tight` for headings, `leading-relaxed` for prose).
* Pair clean sans-serif typefaces with tabular monospace numbers for statistics, financial figures, or timestamps.
* Avoid arbitrary font sizing—adhere to a consistent modular type scale.

### Spacing & Layout
* Use a coherent geometric spacing scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* Ensure balanced whitespace that gives content room to breathe without causing unnecessary vertical scrolling.
* Use flexible grids (`CSS Grid`, `Flexbox`) with strict alignment to strong visual axes.

### Color & Contrast
* Maintain a disciplined palette: 1 dominant neutral background/surface family, 1 primary brand accent, 1 secondary accent, and semantic status tokens (Success, Warning, Danger, Info).
* Ensure all text meets or exceeds **WCAG AA** contrast ratios (minimum `4.5:1` for normal text, `3:1` for large text).
* Use surface elevation layers (Background -> Surface -> Elevated Overlay -> Modal Dialog) rather than random background shades.

### Card Discipline
* **Do not wrap every single element in a card.** Use cards strictly for distinct, modular units of information.
* Favor dividers, subtle borders, background tints, and structural alignment over excessive nested boxes.

---

## 4. Responsive & High-Resolution Architecture

### Responsive Fluidity
* **Mobile as First-Class**: Design touch targets to be at least `44x44px`. Collapse sidebars into sleek drawer navigation or bottom bars.
* **Adaptive Grids**: Transition smoothly from single-column mobile (`col-span-1`) to multi-column desktop (`grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-12`).
* **Dense Layout Adaptation**: For complex data tables, provide mobile card view fallbacks or responsive horizontal scrolling with frozen key columns.
* **Fluid Modals**: Modals must adapt into bottom sheets on mobile screens and centered dialogs on desktop.

### High-DPI & Vector Assets
* Exclusively use SVG or vector iconography (Lucide, Heroicons, Phosphor) with uniform stroke weights.
* Ensure all bitmap imagery has explicit aspect ratios, `object-fit: cover` or `contain`, proper lazy loading (`loading="lazy"`), and responsive srcset where appropriate.
* Never permit stretched, pixelated, or distorted visual assets.

---

## 5. Interaction States & Ergonomics

Every interactive element (buttons, dropdowns, inputs, list items, tabs) must implement complete state handling:

| State | Visual Behavior |
| :--- | :--- |
| **Default** | Clear affordance, legible text, and balanced contrast. |
| **Hover** | Subtle background shift, subtle border luminosity, or crisp micro-elevation. |
| **Focus-Visible** | High-contrast focus ring (e.g. `ring-2 ring-brand-500 ring-offset-2`) for keyboard users. |
| **Active / Pressed** | Slight scale down (`active:scale-[0.98]`) or deepened surface tint. |
| **Disabled** | Muted opacity (`opacity-50`), `cursor-not-allowed`, and prevented click handlers. |
| **Loading** | Integrated spinner or shimmer, preserved button dimensions, disabled click action. |
| **Empty** | Helpful illustration/icon, clear description, and primary call-to-action to create data. |
| **Error** | Localized error banner or inline message with icon and clear remediation advice. |

---

## 6. Micro-Interactions & Animation

* **Transitions**: Use fast, subtle transitions (`150ms` to `250ms`) with smooth easing (`cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`).
* **Entrances**: Use subtle fades and slight translations (`opacity-0 translate-y-1` to `opacity-100 translate-y-0`) for modals, dropdowns, and toast notifications.
* **Restraint**: Avoid over-animating static text, bouncing elements, or long distracting entrance sequences.
* **Accessibility**: Always respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions.

---

## 7. Specialized Interface Patterns

### A. Dashboards & Analytical Workspaces
* Prioritize the primary workflow and key operational metrics at the top.
* Provide quick-triage filters, date range switchers, and progressive disclosure for complex sub-data.
* Use clean sparklines, bar charts, and tabular breakdowns with clear legend labels and interactive tooltips.

### B. High-Conversion Landing Pages
* **Hero Section**: Clear, concise value proposition headline, contextual supporting copy, dual CTA (primary action + secondary demo/learn more), and high-resolution product visual/interactive preview.
* **Social Proof & Trust**: Integrations, certifications, customer logos, or benchmark metrics.
* **Feature Storytelling**: Problem -> Solution narrative using alternating feature grids or interactive tabs.

### C. Forms & Data Intake
* Always place labels above or beside inputs with clear required indicators (`*`).
* Provide inline validation with error messages positioned directly below the offending field.
* Group complex forms into logical fieldsets or multi-step wizard tabs with a sticky summary.

### D. Dark Mode & Obsidian Aesthetics
* Never just invert colors. Use a deep obsidian/slate foundation (`#090d16`, `#020617`, `#0f172a`).
* Use translucent glass surfaces (`backdrop-blur-md bg-slate-900/80 border border-slate-800`).
* Use luminous edge borders and accent glow shadows sparingly to establish focus.

---

## 8. Pre-Delivery Quality Scorecard

Before marking any UI task complete, perform this comprehensive self-review:

```markdown
### 1. Visual Polish
- [ ] Typography scale is disciplined and legible at all sizes.
- [ ] Spacing is consistent and adheres to a geometric scale.
- [ ] Contrast meets WCAG AA standards.
- [ ] No generic AI cliches (excessive blobs, purple soup, unstyled cards).

### 2. Interaction & UX
- [ ] All interactive components have hover, active, focus-visible, and disabled states.
- [ ] Loading and empty states are designed and handled gracefully.
- [ ] Action feedback (toasts, modals, inline status) is immediate and clear.

### 3. Responsive & Multi-Device
- [ ] Layout behaves flawlessly on mobile (375px+), tablet (768px+), desktop (1024px+), and ultrawide (1440px+).
- [ ] Touch targets are at least 44px on mobile devices.
- [ ] Navigation adapts naturally between screen form factors.

### 4. Code & Technical Quality
- [ ] Production build succeeds with 0 errors.
- [ ] No broken imports, missing assets, or console errors.
- [ ] Semantic HTML tags (`<main>`, `<nav>`, `<header>`, `<article>`, `<button>`) are used properly.
- [ ] Reusable components are modular and clean.
```