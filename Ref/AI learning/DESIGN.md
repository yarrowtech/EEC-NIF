# Design System Strategy: The Scholarly Curator

## 1. Overview & Creative North Star
**Creative North Star: "The Scholarly Curator"**

This design system moves away from the clinical, rigid "utility software" look and embraces a **High-End Editorial** aesthetic. We are treating lesson plan generation not just as a task, but as a prestigious publication process. The experience should feel like flipping through a premium educational journal—authoritative yet breathable.

We break the "standard template" by utilizing **intentional asymmetry** and **tonal layering**. Large typographic displays and wide margins create a sense of intellectual space, while overlapping elements and glass-morphic surfaces provide a modern, digital-first depth that feels bespoke rather than out-of-the-box.

---

## 2. Colors & Surface Architecture
The palette is rooted in "Trustworthy Blue" (`primary`) and "Growth Green" (`secondary`), but it is the neutral "Surface" system that provides the premium feel.

### The "No-Line" Rule
To achieve a high-end look, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined solely through background shifts. For example:
*   Use `surface` for the main canvas.
*   Use `surface-container-low` for distinct content sections.
*   Use `surface-container-highest` for highlighting key interactive panels.

### Surface Hierarchy & Nesting
Think of the UI as a series of physical layers of fine paper.
*   **The Canvas:** `background` (#f8f9fa).
*   **The Page:** `surface-container-low` (#f3f4f5).
*   **The Interactive Element:** `surface-container-lowest` (#ffffff) sitting on top of the page to create a soft "lift."

### The "Glass & Gradient" Rule
To prevent the UI from feeling flat or "academic-dry," use Glassmorphism for floating navigation and context menus:
*   **Floating Elements:** `surface-bright` with 80% opacity and a `12px` backdrop-blur.
*   **Signature Textures:** For primary Action buttons and Hero sections, apply a subtle linear gradient from `primary` (#004b71) to `primary_container` (#006494). This adds a "soul" to the color that flat hex codes cannot achieve.

---

## 3. Typography: The Editorial Voice
We use a tri-font system to balance academic authority with modern readability.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-lg` for section starts. The geometric nature of Manrope feels modern and precise.
*   **Body & Titles (Lexend):** Lexend was specifically designed to reduce visual stress and improve reading proficiency. Use `body-lg` (1rem) for lesson content to ensure educators can skim and read long-form plans without fatigue.
*   **Labels (Work Sans):** Use `label-md` for metadata (e.g., "Grade Level," "Duration"). Its slightly wider stance provides a clear "utility" feel that contrasts with the fluid body text.

**Typographic Intent:** Use a "tight-wide" rhythm. Tighten letter-spacing on large `display` headers (-0.02em) and increase line-height on `body` text (1.6) to create that "Curated Journal" vibe.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift in hex value creates a "natural lift."
*   **Ambient Shadows:** If an element must float (like a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.06);`. The color is a tinted version of `on-surface`, making it feel like ambient light in a room rather than a digital effect.
*   **The "Ghost Border" Fallback:** If a container needs more definition (e.g., in high-glare environments), use a "Ghost Border": `outline-variant` (#c0c7d0) at **15% opacity**.

---

## 5. Components

### Interactive Elements
*   **Buttons:**
    *   **Primary:** Gradient from `primary` to `primary_container`. Roundedness `lg` (0.5rem).
    *   **Secondary:** No background. Use `on-secondary-container` text with a `Ghost Border`.
    *   **Tertiary:** Purely typographic using `label-md` bold.
*   **Input Fields:**
    *   Avoid the "box" look. Use `surface-container-high` as the background with a `sm` (0.125rem) bottom-only border using `primary` for the active state.
    *   Labels should use `label-sm` in `on-surface-variant`.
*   **Chips:** Use `secondary_fixed` with `on_secondary_fixed_variant` text. These should have `full` (9999px) roundedness to contrast against the more rectangular cards.

### Education-Specific Components
*   **The "Lesson Card":** Forbid dividers. Use `surface-container-low` for the header and `surface-container-lowest` for the body. Separate sections using `32px` of vertical white space.
*   **Floating Progress Rail:** For long lesson generators, use a glassmorphic sidebar (`surface-bright` + blur) to track completion.
*   **Outcome Badges:** Use `tertiary_container` for "Learning Objectives" to provide a warm, academic highlight that stands out from the blue/green brand colors.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins (e.g., more padding on the left than the right in lesson previews) to mimic premium print layouts.
*   **Do** use `lexend` for all instructional content—it is the workhorse of this system.
*   **Do** utilize `surface-container` tiers to create depth. A `surface-container-highest` panel is perfect for a "Teacher's Toolkit" sidebar.

### Don't:
*   **Don't** use 1px black or grey borders. This instantly kills the high-end editorial feel.
*   **Don't** use standard "drop shadows." If it looks like a default Photoshop shadow, it's too heavy.
*   **Don't** use `primary` color for error states. Use the `error` (#ba1a1a) and `error_container` tokens strictly for feedback.
*   **Don't** crowd the interface. If a lesson plan feels "dense," increase the white space between sections rather than adding dividers.