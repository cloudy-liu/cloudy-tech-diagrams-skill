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

The output is an `.html` file. Open it in any browser and use the Export menu to `Copy Image` / `Download PNG` / `Download PDF` / `Download Draw.io`.

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
