# Diagram Quality Gate

Read this reference before finalizing an HTML Diagram Output. Apply every universal rule and every type-specific rule whose visual pattern appears. This gate verifies diagram expression and rendering; source and domain correctness are completed earlier through source grounding and user review.

## Contract Sources

Before running this gate, read [Visual System](style-references.md) because it owns the exact visual rules; complete the visual portion only when the rendered sheet follows every applicable visual contract.

Before running export checks, read [Draw.io Authoring Contract](drawio-authoring.md) because it owns the exact editable-export rules; complete the export portion only when every applicable coverage and boundary check passes.

When Runtime Mechanism Mode is selected, read [Runtime Mechanism Mode](runtime-mechanism-mode.md) because it owns the causal grammar; complete the runtime portion only when every applicable role and causal path is represented or intentionally omitted with a reason.

## Universal Diagram Expression Rules

- [ ] The requested diagram belongs to the Technical Diagram Scope.
- [ ] The page applies the visual system's canvas, paper, palette, and primitive contracts.
- [ ] The rendered HTML/SVG has been inspected at the target viewport when tooling is available.
- [ ] Component colors carry consistent semantic meaning within the diagram's visual system or legend.
- [ ] The main idea and primary reading direction are evident within three seconds.
- [ ] Text fits inside boxes, pills, headers, legends, and callouts without clipping or overlap.
- [ ] Every connector reads as a clear source-to-target relationship.
- [ ] Connector geometry and arrowhead treatment follow the visual system's connector grammar.
- [ ] Every arrowhead ends at a target boundary or explicitly labeled handoff point.
- [ ] Every connector endpoint lands on meaningful labeled content.
- [ ] Short local connectors stop outside the target fill.
- [ ] Nodes preserve visible arrowheads and unambiguous endpoints when drawn above connectors.
- [ ] Connectors preserve legibility around labels, legends, node titles, and dense component interiors.
- [ ] Every legend sits outside region, cluster, cloud, and trust-boundary boxes.
- [ ] Scope notes follow the visual system's spacing and border contract.
- [ ] The Export Action Menu works and remains excluded from captures.
- [ ] Draw.io Editable Export produces the page header plus exportable SVG sheet as editable native objects.
- [ ] Meaningful SVG components, boundaries, connectors, labels, and shapes have Draw.io Semantic Annotations or an audited ignore reason.
- [ ] The primary Draw.io export path uses editable cells rather than a whole-diagram raster or SVG image.
- [ ] The SVG uses plain shapes and text that both the browser and Draw.io exporter can preserve.

## Type-Specific Diagram Expression Rules

Apply these when the corresponding pattern appears:

- [ ] Message bus pills sit on the event-flow centerline, with connectors split around the pill.
- [ ] Region, cluster, cloud, and trust-boundary boxes leave enough inner padding for labels and nodes.
- [ ] Security and trust-boundary diagrams make every meaningful crossing visible through an endpoint, label, or crossing marker.
- [ ] Process, runtime, and data-flow diagrams maintain a consistent step order and direction; loops, retries, and branches are labeled where they diverge.
- [ ] Runtime Mechanism Mode addresses every applicable causal role defined by its reference and shows a path from trigger to observable outcome.
- [ ] Runtime boundaries appear only when they clarify ownership, process, runtime, trust, service, or responsibility scope.
- [ ] Runtime state, stores, and observable outputs remain visually distinct from active transformations.
- [ ] A non-obvious connector identifies cause, control, data, state update, or observation; crowded labels are shortened or moved to callouts.
- [ ] Table-like panels, multiplicity visuals, repeated markers, and nested regions follow the Draw.io authoring contract.
- [ ] Architecture and deployment containment is visually unambiguous: every node is clearly inside or outside a boundary.
- [ ] Dense diagrams label long or non-obvious connectors so the viewer can identify what moves, calls, or controls.

## Completion Record

Record any check that the current environment could not execute. State the missing tool or constraint and the visual or export risk that remains unverified. Passing source inspection alone is not reported as rendered or export verification.
