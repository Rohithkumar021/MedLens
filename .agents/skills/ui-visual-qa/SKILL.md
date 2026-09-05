---
name: ui-visual-qa
description: >-
  Visual QA and iterative polish skill for inspecting, auditing, testing, and refining rendered
  web interfaces across any framework. Enforces Build -> Render -> Inspect -> Identify Problems ->
  Fix -> Render Again -> Verify loop. Works alongside premium-ui-ux to ensure responsive, accessible,
  and production-ready UI/UX.
---

# UI Visual QA & Iterative Polish Skill

Operate as a combined **Senior Product Designer, Senior UX Engineer, Senior Frontend Engineer, Visual QA Engineer, and Accessibility Reviewer**.

Never declare a UI task complete based solely on source code. The core engineering loop is:

$$\text{Build} \longrightarrow \text{Render} \longrightarrow \text{Inspect} \longrightarrow \text{Identify Problems} \longrightarrow \text{Fix} \longrightarrow \text{Render Again} \longrightarrow \text{Verify}$$

---

## 1. When to Activate

Activate this skill whenever the task involves:
* Building or redesigning a website, web app, landing page, or dashboard
* Creating or polishing frontends, layouts, or component systems
* Fixing responsive layout glitches or broken mobile displays
* Improving visual hierarchy, typography, spacing, or contrast
* Polishing user experience, loading states, error boundaries, or empty states
* Performing post-implementation verification on any frontend pull request or major commit

> [!NOTE]
> **Collaboration Model**: `premium-ui-ux` establishes the design standard and tokens; `ui-visual-qa` inspects, audits, and iteratively refines the rendered output.

---

## 2. Pre-Modification Inspection Protocol

Before changing the interface:
1. **Structure & Dependencies**: Inspect `package.json`, build configs, and package manager (`npm`, `pnpm`, `yarn`).
2. **Framework & Dev Server**: Determine frontend framework and exact development command (`npm run dev`, `npm start`, etc.).
3. **Styling & Tokens**: Identify CSS/Tailwind architecture, theme variables, and existing reusable components.
4. **Behavioral Integrity**: Preserve working backend endpoints, routing structures, and API contracts.

---

## 3. Render & Inspection Workflow

1. **Launch Dev Server**: Launch the project's real local development server using its documented scripts.
2. **Render & Inspect**: Inspect the live interface across primary routes, major components, interactive modals, drawers, tables, and form views.
3. **Multi-State Auditing**: Inspect default, loading, empty, error, and success states across every component.
4. **Tooling Utilization**: When browser tooling or screenshot tools are available, inspect visually. When running headless, execute robust static build/lint validation and verify DOM tree structure.

---

## 4. Visual & Ergonomic Inspection Audits

### A. Layout & Spatial Rhythm
* **Visual Axes**: Check that headings, inputs, icons, and action buttons align along clean vertical and horizontal axes.
* **Spacing Scale**: Enforce a strict geometric spacing system (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`). Eliminate arbitrary one-off margins.
* **Containment & Overflow**: Ensure no unintended horizontal scrollbars (`overflow-x`), unclipped content, or cards touching screen edges.

### B. Typography & Text Presentation
* **Hierarchy & Weight**: Verify distinct scale progression (`xs`, `sm`, `base`, `lg`, `xl`, `2xl`) and weights (`400` to `800`).
* **Line Heights & Readability**: Headings must be tight (`leading-tight`); paragraphs must be legible (`leading-relaxed`).
* **Content Quality**: Check for awkward line wraps, clipped labels, unescaped entities, or unhelpful technical jargon.

### C. Color, Contrast & Surface Elevation
* **WCAG AA Conformance**: Text must exceed `4.5:1` contrast ratio against its direct surface background.
* **Surface Hierarchy**: Base canvas (`#020617` / `#0f172a`) $\rightarrow$ Surface cards (`bg-slate-900/80`) $\rightarrow$ Elevated dropdowns $\rightarrow$ Modal dialogs.
* **Dark Mode Coherence**: Never invert raw colors; maintain deliberate contrast, refined borders, and subtle luminous accents.

---

## 5. Responsive Visual QA Matrix

Test the rendered interface across all key responsive breakpoints:

| Form Factor | Viewport Width | Key Verification Checks |
| :--- | :--- | :--- |
| **Mobile (Compact)** | `375px` – `390px` | Single-column collapse, bottom sheets/drawers, no horizontal blowout, sticky action bars. |
| **Mobile (Standard)** | `414px` | Thumb zone reachability, touch targets $\ge 44 \times 44\text{px}$, readable body font ($\ge 14\text{px}$). |
| **Tablet** | `768px` | 2-column adaptive grids, collapsible sidebars, table horizontal scrolls with sticky headers. |
| **Laptop / Desktop** | `1024px` – `1280px` | Multi-column dashboards, full navigation headers, balanced whitespace distribution. |
| **High-Res / Ultrawide** | `1440px` – `1920px+` | Max-width content containers (`max-w-7xl`), centered alignment, crisp SVG vector assets. |

---

## 6. Interaction & State Coverage

Every interactive element must be tested across all 8 core states:

1. **Default**: Clear visual affordance and legible text.
2. **Hover**: Smooth background shift, subtle border luminosity, or micro-elevation.
3. **Focus-Visible**: High-contrast keyboard focus ring (`ring-2 ring-sky-500 ring-offset-2`). Never suppress focus outlines.
4. **Active / Pressed**: Subtle scale down (`active:scale-[0.98]`).
5. **Disabled**: Reduced opacity (`opacity-50`), `cursor-not-allowed`, and prevented click triggers.
6. **Loading**: Stable dimension preserving skeleton shimmer or inline spinner.
7. **Empty**: Explanatory illustration/icon with a primary Call-to-Action to populate data.
8. **Error**: Inline error banner with clear remediation guidance.

---

## 7. Anti-Generic AI Detection Checklist

Before signing off, verify the design does NOT exhibit generic AI clichés:
* [ ] No muddy purple/magenta gradient soups without brand justification.
* [ ] No endless nesting of rounded cards inside rounded cards.
* [ ] No random floating gradient blobs or decorative clutter without function.
* [ ] No oversized hero headers that push core functionality below the fold.
* [ ] No low-contrast gray text on dark gray surfaces.

---

## 8. Iterative Fix Priority Loop

Classify every discovered issue and address strictly in priority order:

$$\text{P0 (Broken Function/Layout)} \longrightarrow \text{P1 (Usability/Responsive/A11y)} \longrightarrow \text{P2 (Visual Polish/Spacing)} \longrightarrow \text{P3 (Micro-Refinement)}$$

After implementing fixes: **Re-render, re-inspect, and verify regressions were not introduced.**

---

## 9. Final Quality Scorecard

Before considering any UI task complete, evaluate the rendered interface against the 6-part quality scorecard (target $\ge 8/10$ across all metrics):

```markdown
### Visual QA Scorecard
- [ ] Visual Polish & Aesthetic Coherence (Typography, spacing, colors) [ /10]
- [ ] User Experience & Ergonomics (Clarity of primary action, feedback) [ /10]
- [ ] Responsive & Multi-Device Quality (Mobile, tablet, desktop) [ /10]
- [ ] Accessibility & Contrast (WCAG AA, focus rings, semantics) [ /10]
- [ ] Component & State Consistency (Hover, active, loading, error) [ /10]
- [ ] Technical & Build Quality (Zero errors, clean console, passing tests) [ /10]
```