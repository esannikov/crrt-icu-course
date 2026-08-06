# Design QA

## Evidence

- Source visual truth: `design-reference.png`
- Browser-rendered implementation: `qa-implementation.jpg`
- Side-by-side full comparison: `qa-comparison.jpg`
- Focused comparison: `qa-comparison-focus.jpg`
- Outer browser viewport: 1400 × 1200 CSS px
- Phone screen: 393 × 852 CSS px at deviceScaleFactor 1
- Source pixels: 852 × 1846; normalized to 393 × 852 for comparison
- Implementation pixels: 393 × 852
- State: module 2, card 1, correct `CRRT` answer revealed with explanation

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: Manrope provides the bold modern display hierarchy from the selected direction; IBM Plex Sans keeps dense clinical copy readable. Weight, line height, wrapping, and small-label tracking were checked in the patient chooser and answer state.
- Spacing and layout rhythm: the 393 × 852 phone viewport preserves 22 px side margins, consistent vertical rhythm, 40–52 px controls, and a clear question → decision ladder → feedback sequence.
- Colors and tokens: warm paper, rust, amber, and restrained olive match the selected visual direction. Correct and incorrect states remain distinguishable without relying on color alone.
- Image quality and asset fidelity: the target uses no photographic or illustrative assets. Runtime bezel, status bar, icons, and keyboard assets remain the protected template originals; no substitute CSS or SVG artwork was introduced.
- Copy and content: Ukrainian clinical wording is standalone, adult-specific, concise, and visibly separated from the educational safety boundary.
- Accessibility and behavior: semantic buttons and headings, immediate feedback, disabled answered states, focus-visible styling, reduced-motion support, and practical tap targets are present.

## Comparison History

1. Initial patient-chooser capture revealed a P1 responsive defect: a desktop media query reacted to the 1400 px stage and forced a two-column list inside the 393 px phone, clipping cards. The media query was removed. The revised 393 × 852 capture shows a single-column, scrollable five-patient list with no horizontal overflow.
2. The answer-state capture was repeated after the simulator keyboard completed its closing transition. Final evidence shows the intended unobstructed card state.

## Full-view Comparison Evidence

`qa-comparison.jpg` shows the selected direction and implementation together. The implementation retains the defining visual features: warm editorial surface, assertive modern typography, slim progress treatment, vertical decision ladder, olive correct state, immediate rationale, and restrained borders.

## Focused Region Comparison Evidence

`qa-comparison-focus.jpg` isolates the question, answer ladder, selected state, and explanation. Text remains readable at 1:1 phone scale, the selected answer is unambiguous, and the rationale follows immediately in the scroll flow.

## Interactions Tested

- select a patient and open the eight-module home screen;
- open module 1 and submit an incorrect answer;
- verify the correct answer and rationale appear immediately;
- open module 2 and submit the correct CRRT answer;
- verify the next-card action becomes enabled;
- verify progress and source links render;
- inspect browser console: no errors or warnings from the application.

## Follow-up Polish

- P3: a future version could add a compact clinical-data strip to every modality card, not only case-context cards.

final result: passed
