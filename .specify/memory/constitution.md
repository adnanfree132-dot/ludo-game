<!--
SYNC IMPACT REPORT
==================
Version change: (unratified/default) → 1.0.0
Bump rationale: Initial ratification of the project constitution for LUDO, mandating Taste Skill across all UI/UX development, frontend design engineering, and Spec-Driven Development workflows.

Principles defined:
  I.   Taste-Skill Driven UI & UX (NON-NEGOTIABLE)
  II.  Visual Asset & Materiality Integrity
  III. Modern Frontend Architecture & Component Discipline
  IV.  Hardware-Accelerated Performance & Motion Discipline
  V.   Spec-Driven Development (SDD) Rigor & Verification

Added sections:
  - UI & UX Quality Standards & Anti-Slop Discipline
  - Development Workflow & Quality Gates
  - Governance & Enforcement

Templates reviewed for alignment:
  ✅ .specify/templates/plan-template.md — Constitution check gate evaluates Taste-Skill dials & UI guidelines
  ✅ .specify/templates/spec-template.md — Compatible with UI/UX specifications and design reads
  ✅ .specify/templates/tasks-template.md — Accommodates design system tokens, assets, and implementation tasks

Follow-up TODOs: none.
-->

# LUDO Project Constitution

This constitution establishes the binding engineering standards, design philosophy, and quality governance for the **LUDO** project. All contributors, automated tools, and AI coding agents operating on this repository **MUST** comply with these principles.

## Core Principles

### I. Taste-Skill Driven UI & UX (NON-NEGOTIABLE)

Every user interface, visual component, page layout, and interaction flow in the project MUST strictly follow the **Taste-Skill** framework (`design-taste-frontend`, `gpt-taste`, `minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design`, `stitch-design-taste`). Generic, templated, low-effort "AI slop" is strictly forbidden.

- **Mandatory Brief Inference ("Design Read"):** Before writing or modifying any UI/UX code or layout, the agent MUST perform a brief inference: identify page kind, audience, tone/vibe, and aesthetic family.
- **The Three Dials Configuration:** Every interface must be consciously guided by explicit dial values:
  - `DESIGN_VARIANCE` (1 = perfect symmetry, 10 = artsy asymmetry/modern)
  - `MOTION_INTENSITY` (1 = static, 10 = physics/cinematic)
  - `VISUAL_DENSITY` (1 = airy/editorial, 10 = cockpit/data-dense)
- **Anti-Default Design Discipline:**
  - **No AI-Purple/Neon Glows:** Use neutral foundations (Zinc, Slate, Stone) with a single, calibrated high-contrast accent.
  - **No Generic Centered Heroes:** Implement split screens (50/50), asymmetric grids, or content-asset locks when `DESIGN_VARIANCE > 4`.
  - **No Boring Bento Clones:** Bento grids must have varied cell sizes, backgrounds, and rhythm—not 6 uniform white cards with text.
  - **Single Palette & Radius Consistency:** Lock corner radii (all-sharp, all-soft, or documented scale) and maintain strict color consistency across all page sections.
- **Typography Standards:** Default to modern sans display fonts (Geist, Cabinet Grotesk, Satoshi, Outfit) or context-justified serifs. Avoid default Inter or overused display serifs (`Fraunces`, `Instrument Serif`). Ensure descender clearance for italic text and headline hierarchy discipline.

**Rationale:** Modern web applications succeed on immediate visual appeal, clarity, and intentional design. Mandating Taste Skill guarantees every UI created in this project feels bespoke, polished, and agency-grade.

### II. Visual Asset & Materiality Integrity

Interfaces must be visually rich, authentic, and purposeful. Placeholder slop is prohibited.

- **No Div-Based Fake Screenshots:** Never render fake dashboard widgets, terminals, or mock code with generic nested `<div>` boxes. Use real functional component previews, actual screenshots, or curated editorial imagery.
- **Real Imagery & Asset Generation:** Leverage section-specific generated imagery (via `image-to-code`, `imagegen-frontend-web`, `brandkit`) or curated high-resolution photography.
- **Real SVG Iconography & Logos:** Use standardized icon libraries (`@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`) with consistent stroke widths. Social proof walls must use authentic SVG brand marks, never raw unstyled text.

**Rationale:** Users judge software quality by visual credibility. Low-fidelity mockups and fake visuals undermine user trust.

### III. Modern Frontend Architecture & Component Discipline

All frontend code must be modular, robust, accessible, and maintainable.

- **Component & State Isolation:** Server Components (RSC) render static structure; interactive, motion, and physics elements MUST be isolated client leaf components (`"use client"`).
- **Accessibility & Contrast (WCAG AA):** All buttons, text, inputs, and controls MUST pass WCAG AA contrast ratios against their actual rendered background. CTA button text must never wrap awkwardly on desktop, and duplicate CTA intents must be unified.
- **Viewport Stability:** Full-height sections must use `min-h-[100dvh]` to prevent mobile layout jumping. Use native CSS Grid over fragile calculated flexbox math.

**Rationale:** Beautiful design is useless if it is inaccessible, fragile on mobile screens, or architecturally unmaintainable.

### IV. Hardware-Accelerated Performance & Motion Discipline

Interactions and animations must be smooth, motivated, and performant.

- **Animate Transforms and Opacity Only:** Never animate layout-triggering properties (`top`, `left`, `width`, `height`).
- **Motivated Motion:** Every micro-interaction and scroll animation must communicate hierarchy, storytelling, state transition, or feedback. Marquees are limited to a maximum of one per page.
- **Strict Reduced Motion Support:** Every animation above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion` using motion hooks or media queries.
- **No Direct Scroll Event Listeners:** Never use raw `window.addEventListener('scroll')` or React state updates on scroll frames. Use Motion values (`useScroll`, `useMotionValue`), GSAP ScrollTrigger, or CSS scroll-driven animations.

**Rationale:** Janky or gratuitous animations degrade user experience. Motion must elevate the product while respecting performance and accessibility constraints.

### V. Spec-Driven Development (SDD) Rigor & Verification

All project evolution must be structured, verifiable, and spec-driven.

- **The SDD Lifecycle:** Features follow the lifecycle:
  1. `/speckit-specify` — Define requirements and user scenarios.
  2. `/speckit-clarify` — Resolve ambiguities and edge cases.
  3. `/speckit-plan` — Produce architecture, component blueprints, and Taste-Skill dial settings.
  4. `/speckit-tasks` — Decompose into dependency-ordered implementation tasks.
  5. `/speckit-implement` — Execute task-by-task with automated validation.
  6. `/speckit-converge` — Verify alignment with specs and constitution principles.
- **Constitution Quality Gate:** Technical plans (`plan.md`) and implementation reviews MUST explicitly verify compliance with Principle I (Taste Skill) and Principle III (Architecture & Accessibility).

**Rationale:** SDD eliminates guesswork, keeps implementations aligned with business goals, and ensures design governance is systematically enforced.

## UI & UX Quality Standards

| Dimension | Mandatory Standard |
| :--- | :--- |
| **Hero Viewport** | Must fit initial viewport (`min-h-[100dvh]`), headline max 2 lines, subtext max 20 words |
| **Color System** | Base neutral (Zinc/Slate/Stone) + max 1 high-contrast accent (<80% saturation) |
| **Typography** | Modern sans display (Geist/Satoshi/Cabinet Grotesk) + monospace/clean body; proper leading |
| **Interactive States** | Full state coverage: hover, active (`scale-[0.98]`), focus ring, loading skeleton, error, empty |
| **Layout Variety** | Max 2 consecutive split layouts; rhythm in bento grids; max 1 eyebrow per 3 sections |
| **Responsiveness** | Explicit mobile (<768px) stack fallbacks for all multi-column sections |

## Development Workflow & Quality Gates

1. **Design Read & Plan:** Any UI/UX feature begins with a design read and dial declaration in `plan.md`.
2. **Component Implementation:** Components built with utility-first CSS (Tailwind v4), isolated client leaves, and hardware-accelerated Motion.
3. **Pre-Flight Inspection:**
   - Contrast check on all CTAs and form fields
   - Zero CTA button wrapping on desktop
   - Eyebrow count check ($\le \lceil \text{sections}/3 \rceil$)
   - Theme lock consistency (no accidental light/dark inversion mid-page)
   - Reduced-motion validation
4. **Convergence:** Verify code against the initial spec and this constitution before merging.

## Governance

- **Supremacy:** This constitution supersedes informal preferences and ad-hoc conventions.
- **Amendment Procedure:** Amendments require updating `.specify/memory/constitution.md`, incrementing the version in accordance with semantic versioning (MAJOR for removals/redefinitions, MINOR for additions, PATCH for clarifications), and documenting the change in the Sync Impact Report.
- **Enforcement:** All agent prompts, code reviews, and automated workflows MUST audit against these principles.

**Version**: 1.0.0 | **Ratified**: 2026-08-17 | **Last Amended**: 2026-08-17
