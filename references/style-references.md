# Cloudy Visual System

This reference owns the visual language for Cloudy Tech Diagrams. Read it before authoring the SVG so the browser-rendered diagram uses the maintained palette, typography, primitives, connector grammar, spacing, and page composition.

## Core Principles

- Use a warm paper canvas and a calm editorial composition.
- Let spacing and typography carry hierarchy.
- Keep most of the diagram neutral and reserve semantic colors for meaning.
- Use flat fills and thin strokes; omit decorative shadows, glows, gradients, and terminal-style grids.
- Make the primary reading direction and main idea clear within three seconds.
- Use documentation-level density: enough detail to explain the system, with enough neutral space to scan it.

## Color Palette

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
| Secondary Text | `#5F5A54` | Component sublabels and small text inside boxes |
| Muted Text | `#6F6C65` | Captions, edge labels, legend labels, quiet metadata |
| Line | `#9A9991` | Main arrows and dividers |
| Soft Line | `#C9C3B8` | Panel borders and low-priority structure |

## Typography

Use Montserrat for Latin text and Noto Sans SC for Simplified Chinese, with system fallbacks for offline or restricted environments.

```css
font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", sans-serif;
```

For browser-rendered diagrams, include the maintained Google Fonts stylesheet:

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Use these SVG text sizes:

| Text Role | Size | Weight |
| --- | --- | --- |
| Component name | 15px | 600 |
| Component sublabel | 12px | 400 |
| Boundary label | 13px | 600 |
| Edge label | 11px | 500 |
| Legend text | 11px | 500 |

Reserve monospace text for code, commands, ports, payloads, and protocols.

## Visual Elements

**Background:** warm canvas `#E8E6DD`.

**Diagram container:** off-white paper `#FAF9F5`, large rounded corners, and a subtle warm border.

**Component boxes:** rounded rectangles with solid warm fills and 2px strokes.

```svg
<rect x="X" y="Y" width="W" height="H" rx="14" fill="#D8E8D8" stroke="#76B985" stroke-width="2"/>
<text x="CENTER_X" y="Y+28" fill="#3D3C38" font-size="15" font-weight="600" text-anchor="middle">API Service</text>
<text x="CENTER_X" y="Y+48" fill="#5F5A54" font-size="12" text-anchor="middle">FastAPI :8000</text>
```

**Region boundaries:** use a soft filled panel with a dashed warm-gray stroke.

```svg
<rect x="X" y="Y" width="W" height="H" rx="24" fill="#F6F3EC" stroke="#B8B3AA" stroke-width="1.5" stroke-dasharray="8 6"/>
<text x="X+18" y="Y+26" fill="#6F6C65" font-size="13" font-weight="600">AWS Region</text>
```

**Security groups:** use a dashed warm-orange boundary with a transparent or very soft fill.

```svg
<rect x="X" y="Y" width="W" height="H" rx="18" fill="none" stroke="#C88E6A" stroke-width="1.5" stroke-dasharray="6 6"/>
```

**Message buses:** use slim rounded pills placed in the gap between components. In a vertical event flow, center the pill on the same axis as the event line and split the connector into a segment above the pill and an arrow segment below it.

```svg
<rect x="X" y="Y" width="W" height="26" rx="13" fill="#E6D7B4" stroke="#BFA777" stroke-width="1.5"/>
<text x="CENTER_X" y="Y+17" fill="#5F5A54" font-size="11" font-weight="600" text-anchor="middle">Event Bus</text>
```

## Arrows And Connectors

Use open chevron arrowheads for every directional connector. Keep the head unfilled.

```svg
<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
  <path d="M 1 1 L 7 3 L 1 5" fill="none" stroke="#9A9991" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
```

Draw soft region and security boundaries first, then connectors, component nodes, and legends. This keeps connectors above panel fills while nodes remain visually dominant.

Use a straight single-segment line for nearby components on the same row or column. Use a curved SVG path with cubic Bezier `C` commands for long, cross-boundary, return, or otherwise non-trivial routes. Reserve orthogonal elbows for domain-specific grids, network hops, or step-ladder notation that explicitly requires them.

| Flow Type | Stroke | Width | Pattern |
| --- | --- | --- | --- |
| Primary data flow | `#9A9991` | 1.6 | Solid |
| Context/support flow | `#76B985` | 1.6 | Solid |
| Auth/security flow | `#C88E6A` | 1.6 | Dashed `6 6` |
| Event flow | `#BFA777` | 1.6 | Dashed `5 5` |
| Error/blocked flow | `#D87858` | 1.6 | Dashed `6 6` |

## Spacing

- Canvas padding inside SVG: at least 32px.
- Large region boundaries: at least 18px inner label padding.
- Standard component size: 130-170px wide and 68-92px high.
- Minimum horizontal gap between adjacent components: 48px.
- Minimum vertical gap between stacked components: 36px.
- Message bus pills belong in the gap between components and on the exact flow centerline.
- Use four or fewer accent colors per diagram.
- Keep legends outside every region and cluster boundary.
- Place a visible scope note at least 18px below the lowest legend label baseline.
- Style scope note callouts with `fill="#F6F3EC"`, `stroke="#C9C3B8"`, `stroke-width="1"`, and `rx="12"`.
- Leave 8-18px between the scope note callout bottom and the SVG `viewBox` bottom.

## Page Composition

Use this structure:

1. A header with centered title, subtitle, and an unobtrusive export utility.
2. One primary SVG diagram sheet inside the warm paper container.
3. Optional page-support cards below the diagram only when they carry diagram-specific context.
4. Muted footer metadata.

Keep the visible HTML `<h1>` and subtitle as the browser-first hierarchy, and make the diagram the first-screen primary experience.

Use diagram-specific cards instead of fixed template badges. Before annotating SVG content for export, read `drawio-authoring.md#controlled-report-boundary` because it owns inclusion and exclusion semantics. Complete this step only when every meaningful item is inside the controlled boundary or intentionally excluded with an auditable reason.

## Reference Image

`images/warm-template-preview.png` is the repository-owned preview of this visual direction. Use it when maintaining or extending the visual language. Keep generated diagrams self-contained unless the user explicitly requests a particular image.
