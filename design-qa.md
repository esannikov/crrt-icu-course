# Design QA — responsive web correction

## Evidence

- Source problem-state screenshot: `/var/folders/jv/1z95f_wd0jl_vfhlbq1h7ltm0000gn/T/codex-clipboard-253bdae8-abb0-493d-859e-c9d0e30af148.png`
- Source pixels: 2790 × 1682
- Browser-rendered mobile implementation: `qa-responsive-mobile.png`
- Mobile viewport and pixels: 390 × 844 CSS px, deviceScaleFactor 1
- Browser-rendered desktop implementation: `qa-responsive-desktop.png`
- Desktop viewport and pixels: 1440 × 1000 CSS px, deviceScaleFactor 1
- Side-by-side full comparison: `qa-responsive-comparison.jpg`
- Focused comparison: `qa-responsive-comparison-focus.jpg`
- State: patient chooser, warm light theme, five adult cases visible

The supplied screenshot is the rejected state: a phone simulator centered inside a desktop canvas. The intended target is the same course content and visual language presented as a normal responsive webpage without device chrome.

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: Manrope display type and IBM Plex Sans body type are preserved. Mobile headings wrap naturally; desktop headings scale without clipping or truncation.
- Spacing and layout rhythm: the mobile layout uses the entire 390 px viewport with 20 px content margins. The desktop layout uses a centered 1120 px content grid with editorial copy on the left and patient cards on the right.
- Colors and tokens: warm paper, rust, amber and olive tokens are unchanged. Correct/incorrect semantic states remain available throughout the course.
- Image quality and asset fidelity: the course requires no photographic or illustrative content. Simulator bezel, status bar, device selector, home indicator, keyboard and cursor are all absent from the production presentation.
- Copy and content: the five cases, eight modules, 80 cards and medical boundary are unchanged.
- Responsive behavior: no horizontal overflow at 390 px or 1440 px. The body width equals the viewport at both tested sizes.
- Accessibility and behavior: semantic headings and buttons remain intact, controls retain practical mobile tap sizes, focus styling and reduced-motion support remain present.

## Comparison History

1. P1 — the deployed page displayed the protected prototype device stage, iPhone selector, bezel and simulated screen on both desktop and physical phones. The production stylesheet now neutralizes only the presentation shell while preserving runtime integrity.
2. P1 — the original interface stayed locked to a phone-sized column on desktop. Desktop layouts now use responsive two-column grids for patient selection and module navigation.
3. Post-fix evidence at 390 × 844 and 1440 × 1000 confirms full-width mobile rendering, normal document scrolling, no device chrome and no horizontal overflow.

## Full-view Comparison Evidence

`qa-responsive-comparison.jpg` places the rejected simulator screenshot and corrected desktop page together. The correction removes the large empty canvas, phone frame and device menu, then uses the available desktop width for a balanced two-column layout.

## Focused Region Comparison Evidence

`qa-responsive-comparison-focus.jpg` isolates the title and patient cards. Typography, warm palette, borders and content hierarchy remain consistent while the layout changes from simulated hardware to responsive web.

## Interactions Tested

- patient chooser at 390 × 844;
- patient chooser at 1440 × 1000;
- selecting the septic-shock patient;
- rendering the eight-module home screen after selection;
- protected runtime integrity check;
- production Pages build and static packaging tests;
- browser console checked: no application errors or warnings.

## Follow-up Polish

- P3: additional intermediate-width screenshots could be retained for a future visual regression suite.

final result: passed
