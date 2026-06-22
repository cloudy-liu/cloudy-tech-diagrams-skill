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

Not only can you view high-quality architecture diagrams in HTML, the generated output also includes built-in Draw.io export: you can export the same diagram as an editable `.drawio` file and continue fine-tuning in diagrams.net or Draw.io.

### Draw.io Export Demo

<p align="center">
  <img src="./examples/images/export-drawio-ani.gif" alt="Draw.io export animation" width="100%">
</p>

## Draw.io Export Fidelity

Draw.io Export Fidelity is product-critical. The browser-rendered HTML remains the entry-level product experience, and Draw.io export is the high-fidelity editable continuation path for the visible report: page header plus the exportable diagram sheet. This is not an arbitrary HTML/CSS conversion, a full-page DOM conversion, an exact pixel clone, or a one-image export.

The exportable diagram sheet is the annotated SVG sheet inside the page. The HTML page header is mandatory and stays part of the default Draw.io export; it contains the visible HTML `<h1>` and subtitle. The SVG sheet must not duplicate that page title or subtitle unless it is a sheet-owned title or caption. Visible diagram legends and scope notes belong inside the exportable diagram sheet when they carry diagram-specific meaning; fixed template summary badges and page chrome, toolbar, and unrelated footer metadata stay outside the sheet.

By default, the Draw.io button downloads a `.drawio` controlled report export: page header plus the exportable SVG sheet, excluding toolbar, footer, and page-support cards. The goal is editable visual equivalence for the diagram content, not a flattened screenshot.

For release validation, use the Draw.io Visual Regression Gate on pinned renderer versions after the structural export tests pass. The stable rendering path is Playwright Chromium for the HTML capture and diagrams.net Desktop CLI for Draw.io PNG export; the gate compares artifacts with `maxPixelMismatchRatio` thresholds and runs only when `DRAWIO_VISUAL_GATE=1` is set. Keep this as a release validation step, not unconditional CI, because renderer and font differences can otherwise make CI flaky.

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
