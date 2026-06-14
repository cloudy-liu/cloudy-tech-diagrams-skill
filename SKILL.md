---
name: cloudy-tech-diagrams
description: Use when creating polished technical diagrams as self-contained HTML+SVG files for software architecture, system design, process flows, cloud infrastructure, security boundaries, network topology, runtime mechanics, data flow, deployment views, or technical presentation visuals.
---

# Cloudy Tech Diagrams

Create polished technical diagrams as standalone HTML files with inline SVG, embedded CSS, and a warm editorial visual style.

Use this skill for diagrams that explain technical systems. Do not use it for marketing posters, brand visuals, generic slide decks, dashboards, non-technical illustrations, or landing pages.

## Implementation Model

Copy and customize `assets/template.html`, then replace the sample SVG components with the user's system, process, topology, or mechanism. Keep the template structure, export toolbar, and capture scripts unless the user explicitly asks to remove export.

The output is instruction-driven. Build the diagram directly in HTML and SVG; do not depend on external diagram renderers, image generators, Mermaid, Graphviz, or canvas libraries unless the user explicitly asks for a different format.

## Diagram Types

Choose the diagram shape based on the user's description:

- **Architecture view**: clients, edge, APIs, services, data stores, queues, and external integrations.
- **Process flow**: ordered steps, decision points, handoffs, automation stages, approvals, and runbooks.
- **Cloud or deployment view**: regions, networks, gateways, compute, storage, managed services, and boundaries.
- **Security view**: identity, policy, trust boundaries, secrets, network controls, and audit paths.
- **Network topology**: zones, routers, firewalls, subnets, links, protocols, and ingress/egress.
- **Runtime mechanics**: request lifecycle, event propagation, model/tool execution, background jobs, and state transitions.
- **Technical presentation visual**: one focused explanatory diagram for a technical talk, doc, proposal, or incident review.

## Design System

### Core Principles

- Use a warm paper canvas, not a dark dashboard background.
- Prefer calm editorial diagrams over neon infrastructure maps.
- Let spacing and typography carry hierarchy.
- Use semantic colors sparingly; most of the diagram should stay neutral.
- Use flat fills, thin strokes, and no shadows or gradients.
- Keep the main idea readable within three seconds: clear groups, direct flows, short labels.
- Use visual density appropriate to technical documentation: enough detail to be useful, not a decorative infographic.

### Color Palette

Use these semantic colors for component types:

| Component Type | Fill | Stroke | Use For |
| --- | --- | --- | --- |
| External / Generic | `#EDEAE3` | `#9A9991` | Users, browsers, third-party systems |
| Frontend / Client | `#E0E0F0` | `#8585DD` | Web apps, mobile apps, UI surfaces |
| Backend / Compute | `#D8E8D8` | `#76B985` | APIs, services, workers, model execution |
| Data / Storage | `#E4EEF4` | `#6A9BCC` | Databases, caches, object storage, search indexes |
| Cloud / Infrastructure | `#F0DED7` | `#D87858` | Cloud services, edge, gateways, hosting |
| Security / Identity | `#F3E4DA` | `#C88E6A` | Auth, IAM, security groups, policy controls |
| Message Bus / Events | `#E6D7B4` | `#BFA777` | Queues, streams, event buses |
| Neutral Panel | `#FAF9F5` | `#B8B3AA` | Regions, clusters, bounded contexts |

Page and text colors:

| Token | Color | Use For |
| --- | --- | --- |
| Canvas | `#E8E6DD` | Full page background |
| Paper | `#FAF9F5` | Diagram container and cards |
| Soft Paper | `#F6F3EC` | Region fills and secondary panels |
| Ink | `#141413` | Main title and primary labels |
| Body Text | `#3D3C38` | Component labels |
| Muted Text | `#6F6C65` | Sublabels, captions, edge labels |
| Line | `#9A9991` | Main arrows and dividers |
| Soft Line | `#C9C3B8` | Panel borders and low-priority structure |

### Typography

Use Montserrat for Latin text and Noto Sans SC for Simplified Chinese, with system fallbacks for offline or restricted environments.

```css
font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", sans-serif;
```

When producing a browser-rendered HTML diagram, include a Google Fonts stylesheet for Montserrat and Noto Sans SC:

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Use these sizes in SVG:

| Text Role | Size | Weight |
| --- | --- | --- |
| Component name | 15px | 600 |
| Component sublabel | 12px | 400 |
| Boundary label | 13px | 600 |
| Edge label | 11px | 500 |
| Legend text | 11px | 500 |

Avoid monospace text unless the diagram specifically labels code, commands, ports, payloads, or protocols.

### Visual Elements

**Background:** warm canvas `#E8E6DD`. Do not use dark slate backgrounds.

**Diagram container:** off-white paper `#FAF9F5`, large rounded corners, subtle warm border.

**Component boxes:** rounded rectangles with solid warm fills, 2px strokes, no opacity hacks, no duplicated opaque masks.

```svg
<rect x="X" y="Y" width="W" height="H" rx="14" fill="#D8E8D8" stroke="#76B985" stroke-width="2"/>
<text x="CENTER_X" y="Y+28" fill="#3D3C38" font-size="15" font-weight="600" text-anchor="middle">API Service</text>
<text x="CENTER_X" y="Y+48" fill="#6F6C65" font-size="12" text-anchor="middle">FastAPI :8000</text>
```

**Region boundaries:** use a soft filled panel with a dashed warm-gray stroke.

```svg
<rect x="X" y="Y" width="W" height="H" rx="24" fill="#F6F3EC" stroke="#B8B3AA" stroke-width="1.5" stroke-dasharray="8 6"/>
<text x="X+18" y="Y+26" fill="#6F6C65" font-size="13" font-weight="600">AWS Region</text>
```

**Security groups:** dashed warm orange boundary, transparent or very soft fill.

```svg
<rect x="X" y="Y" width="W" height="H" rx="18" fill="none" stroke="#C88E6A" stroke-width="1.5" stroke-dasharray="6 6"/>
```

**Message buses:** slim rounded pills placed in the gap between components. For vertical event flows, center the pill on the same axis as the event line. Do not draw a connector line through the pill; split the event connector into a segment above the pill and an arrow segment below it.

```svg
<rect x="X" y="Y" width="W" height="26" rx="13" fill="#E6D7B4" stroke="#BFA777" stroke-width="1.5"/>
<text x="CENTER_X" y="Y+17" fill="#5F5A54" font-size="11" font-weight="600" text-anchor="middle">Event Bus</text>
```

### Arrows

All arrows use open chevron arrowheads. Never use filled triangular arrowheads.

```svg
<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
  <path d="M 1 1 L 7 3 L 1 5" fill="none" stroke="#9A9991" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
```

Draw soft region and security boundaries first, then arrows, then component nodes, then legends. This keeps arrows visible above panel fills while component boxes remain visually dominant.

| Flow Type | Stroke | Width | Pattern |
| --- | --- | --- | --- |
| Primary data flow | `#9A9991` | 1.6 | Solid |
| Context/support flow | `#76B985` | 1.6 | Solid |
| Auth/security flow | `#C88E6A` | 1.6 | Dashed `6 6` |
| Event flow | `#BFA777` | 1.6 | Dashed `5 5` |
| Error/blocked flow | `#D87858` | 1.6 | Dashed `6 6` |

### Spacing Rules

- Canvas padding inside SVG: at least 32px.
- Large region boundaries: at least 18px inner label padding.
- Standard component size: 130-170px wide, 68-92px high.
- Minimum horizontal gap between adjacent components: 48px.
- Minimum vertical gap between stacked components: 36px.
- Message bus pills belong in the gap between components, not overlapping either box.
- In stacked event flows, message bus pills must sit on the exact centerline of the connected components.
- Keep the number of accent colors to four or fewer per diagram.
- Keep legends outside all region and cluster boundaries.

### Layout Structure

Use this HTML structure:

1. Header with centered title, subtitle, and unobtrusive export toolbar.
2. Main SVG diagram as one exportable diagram sheet inside a warm paper container.
3. Optional page summary cards below the diagram only when they are page-level supporting content.
4. Muted footer metadata.

The HTML page header is mandatory: keep the visible `<h1>` and subtitle as the browser-first visual hierarchy. Do not duplicate that page title or subtitle inside the default SVG sheet. If the exported Draw.io sheet must stand alone, add an explicit sheet-owned title or caption inside the SVG with semantic annotations; that is optional sheet content, not a replacement for the HTML header.

When a diagram legend, scope note, or explanatory card is visible and meaningful diagram content, place it inside the exportable diagram sheet and annotate it so it exports as editable draw.io-native cells. Do not include fixed template summary badges or generic ASYNC/SLO/EDIT cards by default; cards belong in the SVG sheet only when they carry real diagram-specific context. Page chrome, toolbar, and unrelated footer metadata stay outside the sheet.

Do not create a marketing landing page. The first screen should be the diagram itself.

## Draw.io Editable Export

Every generated HTML diagram should include Draw.io export by default. The HTML file remains the only generated artifact; the Draw.io button downloads a `.drawio` file for the main SVG diagram as an exportable diagram sheet.

Draw.io Export Fidelity is product-critical. The browser-rendered HTML remains the entry-level product experience, and Draw.io export is the high-fidelity editable continuation path for the diagram sheet. This is not an arbitrary HTML/CSS conversion, a full-page export, an exact pixel clone, or a one-image export.

Browser visual fidelity is primary. Do not simplify or degrade the rendered HTML/SVG just to make Draw.io export easier. When draw.io cannot reproduce a local visual detail exactly, export the closest editable draw.io-native approximation and keep the browser visual intact.

Page-level `<h1>` and subtitle text are required in the HTML header and are not exported by default. Export sheet-owned title/caption text only when it is explicitly part of the SVG sheet. Visible legends and scope notes inside the SVG are required export content unless intentionally marked with `data-drawio-ignore="true"` and an audit reason.

Style mapping must preserve meaningful SVG fill, stroke, stroke-width, rounded corners, text color, font size, font weight, and marker direction on editable draw.io-native cells. Calibrate dashed strokes instead of passing raw SVG values through blindly: draw.io `dashPattern` is derived from SVG `stroke-dasharray` divided by SVG `stroke-width`, with `fixDash=1` on dashed cells. SVG marker arrowheads should map to open draw.io arrows with unfilled heads; this is an editable draw.io-native approximation, not a literal marker geometry clone.

The Draw.io exporter block is versioned with `CLOUDY_DRAWIO_EXPORTER_VERSION`. When updating generated HTML diagrams or examples, refresh the full exporter block from the current template instead of hand-editing only selected functions, so stale exporter behavior is detectable and does not silently persist.

Use Draw.io semantic annotations on SVG groups so the exporter does not infer diagram intent from visual-only markup:

```svg
<g data-drawio-type="component" data-drawio-role="service" data-drawio-id="api-service">
  <rect x="420" y="220" width="150" height="72" rx="14" fill="#D8E8D8" stroke="#76B985" stroke-width="2"/>
  <text x="495" y="248" fill="#3D3C38" font-size="15" font-weight="600" text-anchor="middle">API Service</text>
  <text x="495" y="268" fill="#6F6C65" font-size="12" text-anchor="middle">FastAPI :8000</text>
</g>
```

Supported default annotations:

- `data-drawio-type="component"` for component-level boxes, pills, stores, services, clients, and similar editable units.
- `data-drawio-type="boundary"` for region, cluster, trust-boundary, or security boundary boxes.
- `data-drawio-type="edge"` for connector groups, separators, lane dividers, and simple line glyphs. Prefer an actual visible SVG `<text>` label; use `data-drawio-label` only as a fallback when there is no visible SVG label to export. Lines without SVG markers should export without arrowheads.
- `data-drawio-type="label"` for standalone semantic text such as lane headings, region headings, section titles, legend labels, callouts, and labels that are not part of a component group.
- `data-drawio-type="shape"` for standalone simple SVG primitives such as `rect`, `circle`, and `ellipse` used in meaningful icons, legend swatches, status glyphs, visual keys, or callout boxes.
- `data-drawio-role` for diagram semantics such as card, panel, caption, scope-note, legend, legend-item, legend-swatch, flow, handoff, or metric. Keep `data-drawio-type` small and stable; use roles for meaning.
- `data-drawio-id` for stable draw.io cell IDs.
- `data-drawio-source` and `data-drawio-target` on edge groups to preserve source/target semantics while keeping fixed visual geometry from the SVG path, line, or polyline. These export as Draw.io metadata by default and must not change the fixed sourcePoint, targetPoint, or waypoints.
- `data-drawio-connect="true"` only when a real Draw.io terminal connection is explicitly wanted and the connection is known not to distort the connector visually. Fixed visual geometry remains the default for high-fidelity exports.
- `data-drawio-ignore="true"` only for visible elements that intentionally do not export. Always add `data-drawio-ignore-reason` so omissions are auditable.

Use component-level export granularity for simple components. A component group should export as one draw.io vertex with the main and secondary SVG text folded into its label when the component has a simple label-only interior. For components with meaningful internal layout, such as nested pills, status rows, icon keys, legends, visual keys, or mini sections, keep the parent component as the containing box and preserve its internal primitives as separate editable draw.io cells. Standalone labels, lane dividers, icon primitives, legend entries, captions, explanatory cards, and scope callouts that carry diagram meaning must be annotated separately so they are not filtered out of the Draw.io export or folded into the wrong parent label. Non-core decorative elements may be approximated or omitted when draw.io cannot express them cleanly.

Visible Diagram Label text is the source of truth for exported visible text. When an SVG element has visible text, `data-drawio-label` must not silently override visible SVG text with different wording. In plain terms: data-drawio-label must not silently override visible SVG text. The exporter must fail strict coverage audit on mismatches. Use non-visible metadata such as `data-drawio-note` or `aria-label` for internal notes and semantic descriptions.

Do not use a whole-diagram raster or SVG background reference layer as the default Draw.io export path. The primary export must stand on editable draw.io-native objects.

### Draw.io Visual Regression Gate

For release validation, run the Draw.io Visual Regression Gate after structural completeness, visible-label, sampled-edge, style-mapping, and exporter-version tests pass. The stable rendering path is:

1. Render the browser HTML sheet with Playwright Chromium at 1200x900, deviceScaleFactor 1, light color scheme, and the `.diagram-container svg` selector after `document.fonts.ready`.
2. Export the generated `.drawio` file with diagrams.net Desktop CLI using `draw.io --export --format png --output <drawioPng> <drawioFile>`.
3. Compare the HTML PNG and draw.io PNG with `node tools/drawio-visual-regression.mjs gate --config visual-regression/drawio-gate.config.json` and `DRAWIO_VISUAL_GATE=1`.

The default threshold is `maxPixelMismatchRatio=0.015`, `perChannelTolerance=3`, and `maxAverageChannelDelta=2`. This is a release validation gate, not an unconditional PR check, because browser, diagrams.net, and font rendering versions can otherwise make CI flaky. Ordinary CI should validate the gate configuration and PNG comparator behavior without requiring external screenshot artifacts.

Known limitations are acceptable only when documented in `visual-regression/drawio-gate.config.json`: font rendering drift, draw.io-native approximations for SVG markers and dash patterns, and intentional exclusion of page chrome and toolbar UI. A passing pixel gate does not replace the editable-object contract; it runs after the semantic export tests.

## Export Toolbar

Every generated diagram should keep the built-in export toolbar unless the user asks to remove it. The export control must stay in the title-line header utility area, not centered below the subtitle as a content row.

Keep these intact:

- `id="report-container"` on the outer `.container`.
- The two CDN scripts in `<head>`:
  - `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`
  - `https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js`
- `.toolbar` markup and CSS.
- `copyAsImage()`, `downloadPNG()`, `downloadPDF()`, and `downloadDrawio()` before `</body>`.
- The clipboard image export action should be labeled `Copy Image`, with a tooltip and accessible label that say it copies the diagram as an image to the clipboard.
- The file export actions should be labeled `Download PNG`, `Download PDF`, and `Download Draw.io`.
- `ignoreElements: (e) => e.classList && e.classList.contains('toolbar')` during capture.
- `backgroundColor: '#E8E6DD'` in html2canvas calls.

Clipboard export requires a user gesture and a secure context. PNG and PDF download work in ordinary modern browsers.

## Template

Copy and customize `assets/template.html`.

Key customization points:

1. Update `<title>`, `h1`, subtitle, and footer metadata.
2. Adjust SVG `viewBox` dimensions to fit the diagram.
3. Replace sample components with the user's technical components, steps, regions, or flows.
4. Wrap meaningful SVG components, boundaries, and connectors in Draw.io semantic annotation groups.
5. Draw boundaries first, then arrows, then nodes, then legends.
6. Keep labels short. Prefer `API Service` plus `FastAPI :8000` over long sentences.

## Output

Always produce a single self-contained `.html` file with:

- Embedded CSS.
- Inline SVG.
- No external images.
- CDN JavaScript only for Copy Image, Download PNG, and Download PDF export.
- Built-in JavaScript for Draw.io editable export.
- Warm editorial visual design.

The file must render correctly when opened directly in any modern browser.

## Quality Checklist

Before finalizing a generated diagram, verify diagram expression quality: the rendered artifact must be visually clear, internally coherent, and free of SVG layering mistakes. Do not use this checklist to encode product, project, source-document, or domain-specific correctness rules; those belong in task reasoning and user review.

### Universal Diagram Expression Rules

- [ ] The requested diagram type is inside the technical diagram scope.
- [ ] Page background is warm `#E8E6DD`, not dark slate.
- [ ] Diagram container uses paper `#FAF9F5`.
- [ ] No neon colors, glows, shadows, or gradients.
- [ ] Inspect the rendered HTML/SVG at the target viewport when tooling is available; do not rely only on source coordinates for connectors, labels, or layering.
- [ ] Component colors match semantic meaning within the diagram's own legend or visual system.
- [ ] Main idea and primary reading direction are obvious within three seconds.
- [ ] Text labels fit inside boxes, pills, headers, and legends without clipping or overlap.
- [ ] Every connector can be read as a clear source-to-target relationship.
- [ ] Every arrowhead uses an open chevron and is visible in the rendered diagram.
- [ ] Every arrowhead terminates at a target boundary or an explicitly labeled handoff point.
- [ ] No connector points into unlabeled empty space.
- [ ] Short local connectors between nearby boxes stop outside the target box, not inside its fill.
- [ ] If connectors are drawn before nodes, inspect the rendered output to ensure nodes did not cover arrowheads or make endpoints ambiguous.
- [ ] Connectors do not cross through unrelated labels, legends, node titles, or dense component interiors.
- [ ] Legend is outside every boundary box.
- [ ] Export toolbar still works and is excluded from captures.
- [ ] Draw.io export button is present by default and downloads a `.drawio` file for the main SVG diagram.
- [ ] Main SVG components, boundaries, and connectors use Draw.io semantic annotations where they should export as editable draw.io-native objects.
- [ ] Draw.io export does not rely on a whole-diagram raster or SVG image as the primary export path.
- [ ] SVG is plain shapes and text; avoid `foreignObject`.

### Type-Specific Diagram Expression Rules

Apply these only when the corresponding visual pattern appears:

- [ ] Message bus pills are centered on their event-flow axis, with connector lines split around the pill instead of crossing through it.
- [ ] Region, cluster, cloud, or trust-boundary boxes have enough inner padding that labels and nodes do not touch the boundary stroke.
- [ ] Security or trust-boundary diagrams make boundary crossings visually explicit with a connector endpoint, label, or crossing marker.
- [ ] Process, runtime, and data-flow diagrams have a consistent step order and direction; loops, retries, and branches are labeled where they break the main direction.
- [ ] Architecture and deployment diagrams keep containment visually unambiguous: a node is either clearly inside a boundary or clearly outside it, not sitting on the edge.
- [ ] Dense diagrams use labels on long or non-obvious connectors so the viewer can tell what is moving, calling, or controlling.

### Adding New Diagram Expression Rules

When a new issue appears, add a checklist rule only if it generalizes beyond the current project and catches a diagram-level clarity or rendering problem. Use this admission test before editing the skill:

- **Problem it catches:** What visual misunderstanding, broken connector, overlap, clipping, or layering mistake does this prevent?
- **Why it generalizes:** Why would the same issue apply to other architecture, flow, security, topology, or deployment diagrams?
- **Rule:** Write one concise, observable checklist item.
- **How to verify:** State what the agent must inspect in the rendered output, screenshot, or SVG structure.
- **Where it belongs:** Put always-relevant checks in Universal rules; put pattern-specific checks in Type-Specific rules.

Do not add checklist rules whose only purpose is to decide whether a domain model, source document interpretation, product architecture, vendor terminology, or project-specific component choice is correct.
