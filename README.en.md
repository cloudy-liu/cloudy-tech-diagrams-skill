# Cloudy Tech Diagrams Skill

English | [简体中文](README.md)

# What Problem Does It Solve

Drawing architecture diagrams by hand is a thing of the past. This skill generates Claude-style warm-toned architecture diagrams — the same visual style as Claude's official blog illustrations. Clean, warm, and professional.

Many diagramming tools exist, but **modifying the output is painful**. This skill generates diagrams that **export to Draw.io with high fidelity** (my personal go-to tool), so when the Agent doesn't nail every detail, you can export to Draw.io and fine-tune it yourself.

## Showcase

### Microservices Architecture

<p align="center">
  <img src="./examples/images/microservices.png" alt="Microservices architecture" width="100%">
</p>

### Perfetto Project Architecture

<p align="center">
  <img src="./examples/images/perfetto-docs-architecture.png" alt="Perfetto project architecture" width="100%">
</p>

### Draw.io Export Demo

When you want to manually tweak details or convert to a `.drawio` file for local editing, you can use the one-click export `download drawio` feature to directly export the drawio file and continue fine-tuning in diagrams.net / draw.io. Stay in control of every detail!

<p align="center">
  <img src="./examples/images/export-drawio-ani.gif" alt="Draw.io export animation" width="100%">
</p>

## Draw.io Export Fidelity

Draw.io Export Fidelity is product-critical. The browser-rendered HTML remains the entry-level experience, and the Draw.io file is the high-fidelity editable continuation path for local refinement. The goal is editable visual equivalence with native draw.io shapes, not an arbitrary HTML/CSS conversion, full-page DOM conversion, one-image export, or whole-diagram raster export.

The default Draw.io export is a controlled report export: page header plus exportable SVG sheet, excluding toolbar, footer, and page-support cards. The HTML page header is mandatory, so the visible HTML `<h1>` and subtitle travel with the exportable diagram sheet. A sheet-owned title or caption should appear only when the exported sheet needs standalone context, and it should not duplicate the page title or subtitle.

The exportable diagram sheet contains the diagram content users expect to keep editing: nodes, boundaries, connectors, labels, diagram legend, scope note, and meaningful summary content. Avoid fixed template summary badges. Decorative page chrome, toolbar, and unrelated footer metadata stay outside the Draw.io file.

Font fidelity is part of the same contract. Browser previews load Montserrat from Google Fonts, but Draw.io files do not embed fonts; they keep editable text cells with `fontFamily=Montserrat`. For matching local Draw.io rendering, install Montserrat on the machine that opens the `.drawio` file. Otherwise diagrams.net / draw.io will use font fallback, and the right-side text panel may still show Montserrat even though the actual rendered font is different.

Draw.io Visual Regression Gate is the release validation check for export fidelity. It renders HTML with Playwright Chromium, renders the exported `.drawio` file with diagrams.net Desktop CLI, and compares the screenshots with configured thresholds such as maxPixelMismatchRatio. Normal CI keeps this as config validation to avoid flaky CI; full screenshot comparison is enabled explicitly with DRAWIO_VISUAL_GATE=1 for release validation.

## Quick Start

Quick start has two steps: first install the Skill to a location where the agent can read it, then call it in your prompt.

### Installation

Give your Agent (Claude Code, Codex, Cursor, etc.) this GitHub URL and it will install automatically:

```text
https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git
```

The agent picks the right install location based on your environment.

### Usage

Give the agent a system description and ask it to use this skill:

```text
Use cloudy-tech-diagrams to generate a technical architecture diagram for the following system:

- React web app and mobile clients
- API Gateway
- User Service, Order Service, Product Service
- PostgreSQL, Redis, Elasticsearch
- Kafka event stream
- Kubernetes deployment
```

Or have the agent analyze your codebase first:

```text
Analyze this codebase and summarize its architecture, then use cloudy-tech-diagrams to generate a diagram.
```

To match a specific document or existing diagram, include the link, screenshot, or description:

```text
Read this documentation, identify the core project architecture, then use cloudy-tech-diagrams to generate an HTML diagram. Focus on architecture, not implementation details.
```

The output is an `.html` file. Open it in any browser and use the Export menu actions: Copy Image / Download PNG / Download PDF / Download Draw.io.

## Repository Structure

```text
cloudy-tech-diagrams-skill/
├── SKILL.md
├── assets/
│   └── template.html
├── references/
│   ├── style-references.md
│   └── images/
├── examples/
│   ├── web-app.html
│   ├── microservices.html
│   ├── perfetto-docs-architecture.html
│   └── images/
├── README.md
├── README.en.md
└── LICENSE
```

`SKILL.md` is the core instruction file the agent reads. `assets/template.html` is the starting template for diagram generation. `references/` stores style references. `examples/` contains sample outputs for the GitHub README and maintenance — not included in minimal releases.

## Credits

* Inspired by [Cocoon-AI/architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator), which uses a dark mode style. This skill optimizes and customizes it.

## License

MIT License. See [LICENSE](LICENSE).
