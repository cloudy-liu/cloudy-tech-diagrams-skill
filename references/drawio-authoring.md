# Draw.io Authoring Contract

This reference owns the browser-to-Draw.io continuation contract. Read it before annotating the SVG so meaningful diagram content exports as editable draw.io-native objects without weakening Browser Visual Fidelity.

## Product Contract

Every generated HTML Diagram Output includes Draw.io Editable Export by default. The HTML file remains the only generated artifact; the `Download Draw.io` action creates a `.drawio` controlled report export containing the page header plus the exportable SVG sheet, while excluding the toolbar, footer, and page-support cards.

Draw.io Export Fidelity is product-critical. The browser-rendered HTML remains the entry-level experience, and Draw.io is the high-fidelity editable continuation path for the visible report. The export is an annotated SVG-sheet conversion rather than arbitrary HTML/CSS conversion, full-page DOM conversion, exact pixel cloning, or one-image export.

Browser Visual Fidelity is primary. Keep the browser visual intact when draw.io cannot reproduce a local detail exactly, and export the closest editable draw.io-native approximation.

## Controlled Report Boundary

Export the visible page-level `<h1>` and subtitle as native Draw.io text cells above the SVG sheet. Keep the default SVG sheet free of duplicate page title or subtitle text. Export a sheet-owned title or caption only when it is explicitly part of the sheet.

Meaningful legends, scope notes, and diagram-specific explanatory cards inside the SVG are export content. Mark an intentional omission with `data-drawio-ignore="true"` and an auditable `data-drawio-ignore-reason`. Page chrome, the toolbar, unrelated footer metadata, and page-support cards stay outside the controlled report.

## Draw.io Semantic Annotations

Annotate SVG groups so the exporter receives diagram intent instead of inferring it from visual-only markup.

```svg
<g data-drawio-type="component" data-drawio-role="service" data-drawio-id="api-service">
  <rect x="420" y="220" width="150" height="72" rx="14" fill="#D8E8D8" stroke="#76B985" stroke-width="2"/>
  <text x="495" y="248" fill="#3D3C38" font-size="15" font-weight="600" text-anchor="middle">API Service</text>
  <text x="495" y="268" fill="#6F6C65" font-size="12" text-anchor="middle">FastAPI :8000</text>
</g>
```

Supported annotation types:

- `data-drawio-type="component"` for boxes, pills, stores, services, clients, and similar editable units.
- `data-drawio-type="boundary"` for regions, clusters, trust boundaries, and security boundaries.
- `data-drawio-type="edge"` for connectors, separators, lane dividers, and simple line glyphs. A line without an SVG marker exports without an arrowhead.
- `data-drawio-type="label"` for standalone semantic text such as lane headings, region headings, section titles, legend labels, and callouts.
- `data-drawio-type="shape"` for standalone meaningful `rect`, `circle`, and `ellipse` primitives such as swatches, glyphs, visual keys, and callout boxes.
- `data-drawio-role` for meaning such as card, panel, caption, scope-note, legend, legend-item, legend-swatch, flow, handoff, or metric.
- `data-drawio-id` for stable cell IDs.
- `data-drawio-ignore="true"` with `data-drawio-ignore-reason` for audited omissions.

Keep `data-drawio-type` small and stable. Put diagram-specific meaning in `data-drawio-role`.

## Edge Semantics

Use `data-drawio-source` and `data-drawio-target` on edge groups to preserve source and target semantics as metadata while retaining the SVG path, line, or polyline's fixed visual geometry. These annotations preserve IDs without changing fixed `sourcePoint`, `targetPoint`, or waypoints.

Use `data-drawio-connect="true"` only when a real Draw.io terminal connection is explicitly required and known to preserve connector geometry. Fixed visual geometry is the high-fidelity default.

Prefer an actual visible SVG `<text>` edge label. Use `data-drawio-label` only when the edge has no visible SVG label.

## Component Granularity

Export a simple component as one draw.io vertex with its main and secondary text folded into the label. For components with meaningful internal layout, keep the parent as the containing box and export meaningful pills, status rows, icons, metrics, legend swatches, explanatory text, and dividers as separate editable cells.

Annotate standalone labels, lane dividers, icon primitives, legend entries, captions, explanatory cards, and scope callouts separately when they carry diagram meaning. Approximate or omit only non-core decoration that draw.io cannot express cleanly.

For table-like state stores, keep the outer container as a component and export every meaningful cell as a standalone label plus every meaningful divider as a standalone edge. For stacked multiplicity visuals, export background layers as standalone shapes while the front layer remains the semantic component. Preserve square repeated markers with `rect` and `rx=0`; use circles only for intentional round markers. Keep nested sub-regions as one primitive unless their parts carry separate meaning.

## Visible Diagram Label

Visible Diagram Label text is the source of truth for exported visible text. `data-drawio-label` must not silently override visible SVG wording. A mismatch fails strict coverage audit. Store internal notes and semantic descriptions in non-visible metadata such as `data-drawio-note` or `aria-label`.

## Style Mapping

Preserve meaningful SVG fill, stroke, stroke-width, rounded corners, text color, font size, font weight, and marker direction on editable cells.

Calibrate dashed strokes for draw.io: derive `dashPattern` by dividing SVG `stroke-dasharray` values by SVG `stroke-width`, and set `fixDash=1` on dashed cells. Map SVG marker arrowheads to open Draw.io arrows with unfilled heads. This is an editable draw.io-native approximation rather than a literal marker geometry clone.

The primary export path stands on editable draw.io-native objects. A whole-diagram raster or SVG background reference layer is not part of the default contract.

## Export Action Menu

Keep the built-in export utility in the title-line header area. Preserve:

- `id="report-container"` on the outer `.container`.
- The `html2canvas@1.4.1` and `jspdf@2.5.2` CDN scripts.
- `.toolbar` markup and CSS.
- `copyAsImage()`, `downloadPNG()`, `downloadPDF()`, and `downloadDrawio()`.
- Labels and accessible names: `Copy Image`, `Download PNG`, `Download PDF`, and `Download Draw.io`.
- Toolbar exclusion through `ignoreElements` during captures.
- `backgroundColor: '#E8E6DD'` in html2canvas calls.

Clipboard export requires a user gesture and secure context. PNG and PDF downloads work in ordinary modern browsers.

## Export Verification

Run these checks after the rendered sheet is stable:

1. Exercise `Copy Image` when secure-context and clipboard tooling are available.
2. Exercise `Download PNG` and confirm a non-empty image is produced without the toolbar.
3. Exercise `Download PDF` and confirm a non-empty document is produced without the toolbar.
4. Exercise `Download Draw.io` and confirm a valid `.drawio` report contains the page header and exportable SVG sheet.
5. Confirm meaningful content is represented by editable native cells and passes the coverage audit against the controlled report boundary.

**Complete when:** Every available export check passes. When an action cannot run, state that export checks were not run for that action and give the constraint.

## Template Customization

Start from `assets/template.html` and:

1. Update `<title>`, `<h1>`, subtitle, and footer metadata.
2. Adjust SVG `viewBox` dimensions to fit the diagram.
3. Replace sample components with the source-grounded semantic model.
4. Wrap meaningful components, boundaries, and connectors in semantic annotation groups.
5. Keep the maintained exporter block intact.

The finished file uses embedded CSS, one primary inline SVG, no external images, export-only CDN JavaScript, and built-in Draw.io export JavaScript. It renders when opened directly in a modern browser.
