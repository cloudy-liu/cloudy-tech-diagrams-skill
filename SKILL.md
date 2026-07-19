---
name: cloudy-tech-diagrams
description: Use when creating polished technical diagrams as self-contained HTML+SVG files for software architecture, system design, process flows, cloud infrastructure, security boundaries, network topology, runtime mechanics, data flow, deployment views, or technical presentation visuals.
---

# Cloudy Tech Diagrams

Create technical diagrams as standalone HTML files with inline SVG, embedded CSS, a warm editorial visual system, and editable Draw.io export.

Use this skill to explain technical systems. Make the diagram the first-screen primary experience. Marketing posters, brand visuals, generic slide decks, dashboards, landing pages, and non-technical illustrations belong to other workflows.

## Implementation Model

Start from `assets/template.html` and replace its sample diagram with the user's source-grounded system, process, topology, or mechanism. Preserve the page shell, Export Action Menu, capture behavior, and versioned Draw.io exporter unless the user explicitly removes an export action.

Author the diagram directly in HTML and SVG. External diagram renderers, image generators, Mermaid, Graphviz, and canvas libraries are separate output branches used only when the user explicitly requests another format.

## Authoring Process

Follow these stages in order. Finish each stage's completion criterion before moving to the next one; the criteria keep the process predictable across agents with different reasoning strength.

### 1. Ground the Source

Read the user's request and every supplied source. Build a content inventory before choosing coordinates: components, actors, boundaries, state or stores, flows, constraints, observable outputs, and unresolved assumptions. Treat unsupported details as explicit assumptions rather than established facts.

**Complete when:** Every user-provided component and relationship is represented in the content inventory, intentionally omitted with a reason, or marked uncertain. Every planned diagram claim is grounded in a source or labeled as an assumption.

### 2. Route the Diagram

Identify the reader's primary question, then select one primary diagram family from the catalog below and its applicable Diagram Expression Mode. The family identifies the explanation; the mode identifies the elements, layout, connectors, and checks used to express it. Choose one reading direction and use secondary patterns only when they support the primary question.

**Complete when:** One primary reader question, one primary diagram family, one applicable Diagram Expression Mode, and one reading direction are explicit. Every planned boundary and secondary pattern supports that choice.

### 3. Build the Semantic Model

Describe the diagram before drawing it: nodes, containers, boundaries, state, stores, outputs, and connectors. Give every connector a source, target, and meaning such as request, event, control, state update, observation, or response. Resolve ambiguous endpoints before assigning SVG coordinates.

**Complete when:** Every visible semantic element has a role, and every connector has an explicit source, target, and meaning. The model contains a complete primary reading path from its entry point to its outcome.

### 4. Implement from the Template

Before authoring the SVG, read `references/style-references.md`; it owns the maintained palette, typography, primitives, connector grammar, spacing, and page composition. Apply every visual rule relevant to the selected mode.

Before annotating meaningful SVG content, read `references/drawio-authoring.md`; it owns the controlled report boundary, semantic annotation schema, component granularity, edge metadata, style mapping, visible-label contract, and Export Action Menu. Apply that contract while replacing the template's sample content.

**Complete when:** The HTML satisfies the Universal Contracts below, every meaningful visible diagram element passes Draw.io coverage or carries an audited ignore reason, and the rendered content matches the source-grounded semantic model.

### 5. Render and Repair

Open the HTML at the target viewport when rendering tooling is available. Inspect the rendered sheet rather than trusting coordinates alone, then repair clipping, overlap, layering, unclear reading order, ambiguous connector endpoints, and text that does not fit.

Before finalizing, read `references/quality-gate.md` and apply every universal rule plus every type-specific rule whose visual pattern appears. Repeat the render-and-repair loop until the applicable gate passes.

**Complete when:** All available rendered checks pass at the target viewport. When browser or rendering tooling is unavailable, complete the source-level checks and state that rendered checks were not run, including which visual risks remain unverified.

### 6. Verify Exports

Exercise the available export actions after the rendered sheet is stable. Use the verification contract in `references/drawio-authoring.md` to confirm that captures exclude the toolbar and Draw.io export preserves meaningful content as editable native cells inside the controlled report boundary.

**Complete when:** All available export checks pass and the Draw.io coverage contract is satisfied. When an export action cannot run in the current environment, state that export checks were not run for that action and give the constraint.

## Diagram Types

Choose the family that answers the reader's question:

- **Architecture View:** what parts exist and how they connect.
- **Process Flow:** which ordered steps, decisions, handoffs, approvals, and automations occur.
- **Sequence Diagram:** which time-ordered messages participants exchange.
- **Data Flow:** where data moves and how it transforms between sources, processing, and sinks.
- **Cloud or Deployment View:** how regions, networks, gateways, compute, storage, and managed services contain and connect.
- **Security View:** how identity, policy, trust boundaries, secrets, network controls, and audit paths protect the system.
- **Network Topology:** how zones, routers, firewalls, subnets, protocols, and ingress or egress links relate.
- **Runtime Mechanism Mode:** how a mechanism happens at runtime and what causes what.
- **Technical Presentation Visual:** one focused explanatory diagram for a technical talk, document, proposal, or incident review.

Use the family as the primary mode unless a narrower expression mode is defined below or in a referenced branch guide.

## Runtime Mechanism Mode

Use Runtime Mechanism Mode for causal runtime behavior such as request handling, background execution, model or tool orchestration, profiling, scheduling, retries, and state transitions. Architecture View remains the structural inventory; Sequence Diagram owns strict message order; Data Flow owns movement and transformation.

Runtime Mechanism Mode is a Diagram Expression Mode, not a visual theme. Render it through the maintained Cloudy visual system unless the user requests another treatment.

Before drawing a runtime mechanism, read `references/runtime-mechanism-mode.md`; it owns the causal-role extraction questions, layout patterns, connector labeling, annotation roles, and runtime-specific editable primitives. Address every applicable causal role deliberately and make every meaningful boundary crossing visible.

**Complete when:** The semantic model shows a source-grounded causal path from its trigger to its observable outcome, and every applicable role from the runtime reference is represented or intentionally omitted with a reason.

## Universal Contracts

### HTML Diagram Output

- Produce one browser-ready `.html` artifact with embedded CSS and one primary inline SVG sheet.
- Keep the visible HTML `<h1>` and subtitle as the page hierarchy. Add a sheet-owned title or caption only when the SVG export needs local context.
- Keep meaningful legends, scope notes, and diagram-specific explanatory cards inside the SVG sheet; keep toolbar and unrelated footer metadata outside it.
- Use external network dependencies only for maintained web fonts and PNG/PDF export libraries. The core diagram remains readable through system fallbacks.

### Browser Visual Fidelity

- Browser Visual Fidelity is primary. Preserve the warm editorial visual system and the diagram's clearest browser expression when export formats require approximation.
- Use plain SVG shapes and text that remain inspectable, renderable, and editable.

### Draw.io Editable Export

- Include Draw.io Editable Export by default as the product-critical continuation path from the HTML Diagram Output.
- Export the controlled report as native editable objects: page header plus exportable SVG sheet, excluding toolbar, footer, and page-support cards.
- Use Draw.io Semantic Annotations for meaningful content. Visible Diagram Label text remains the source of truth for exported visible wording.
- Keep whole-diagram raster or SVG background images outside the primary export path.

### Export Action Menu

- Preserve `Copy Image`, `Download PNG`, `Download PDF`, and `Download Draw.io` with their maintained labels and accessible names.
- Keep the utility in the title-line header area and exclude it from captures.
- Treat clipboard security requirements and unavailable local tooling as explicit verification constraints.
