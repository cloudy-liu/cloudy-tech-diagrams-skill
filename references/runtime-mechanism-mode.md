# Runtime Mechanism Mode

Use this reference when a diagram needs to explain runtime causality: how a mechanism starts, moves through participants and boundaries, changes state, and produces an observable result.

Runtime Mechanism Mode is inspired by engineering design-doc mechanism diagrams, but it is not tied to shared memory, threads, buffers, or caches; those are examples of possible runtime objects, not requirements.

## Core Question

Runtime Mechanism Mode answers:

```text
How does this mechanism happen at runtime, and what causes what?
```

## Causal Roles

Before drawing, extract the roles below. A diagram does not need every role, but missing roles should be a deliberate choice. Do not draw every implementation detail when the causal path only needs a subset.

| Role | Extraction Question | Cloudy Rendering |
| --- | --- | --- |
| Trigger | What starts, resumes, retries, or interrupts the mechanism? | External component, compact callout, or labeled ingress edge |
| Participants | Which systems, modules, actors, agents, or runtime units participate? | Semantic component boxes |
| Boundaries | Which ownership, service, trust, runtime, or responsibility scopes matter? | Soft dashed panels labeled with the scope |
| Carriers | What carries the effect between participants? | Labeled connectors, event pills, artifacts, or data components |
| Transformations | What validates, routes, enriches, computes, coordinates, or decides? | Backend, compute, or security components |
| State / Stores | What state is read, written, cached, accumulated, or remembered? | Data/storage components, compact tables, or state panels |
| Observable Outputs | What trace, metric, log, response, side effect, decision, or artifact appears? | Output component, artifact box, or scope note |

## Layout Patterns

### Trigger-To-Output Causal Chain

Use when one dominant mechanism path matters.

```text
Trigger -> Participant -> Transformation -> State / Store -> Observable Output
```

Keep this readable left-to-right or top-to-bottom. Add short connector labels only where the cause or carrier is not obvious.

### Boundary-Centered Mechanism View

Use when the main explanation is what happens inside a runtime or ownership scope.

```text
External trigger -> [Runtime boundary: participants + transformations + state] -> Output
```

Draw the boundary first, place internal participants with clear padding, and make every boundary crossing visible.

### Coordinator / Worker / State / Output

Use when a coordinator delegates work and gathers results.

```text
Trigger -> Coordinator -> Worker group -> State / Stores -> Observable Output
```

Group workers visually when their individual identities do not matter. Keep coordinator and worker responsibilities distinct.

### Producer / Carrier / Transformation / Output

Use when an effect moves through an intermediate carrier before it is processed.

```text
Producer -> Carrier -> Transformation -> Observable Output
```

The carrier may be a request, event, file, stream, queue, buffer, memory region, API call, or any other transport. Do not require a specific primitive.

## Connector Labels

Use connector labels only when the relationship is not clear from layout, role, or endpoint names. In crowded connector paths, do not place visible text where it competes with arrowheads, node titles, boundary labels, or dense state. Shorten the label, move the label to a callout, or omit the visible label and let the connector geometry carry the relationship.

## Draw.io Annotations

Use stable `data-drawio-type` values and put runtime meaning in `data-drawio-role`.

```svg
<g data-drawio-type="boundary" data-drawio-role="runtime-boundary" data-drawio-id="runtime">
  <rect x="260" y="90" width="560" height="300" rx="24" fill="#F6F3EC" stroke="#B8B3AA" stroke-width="1.5" stroke-dasharray="8 6"/>
  <text x="284" y="120" fill="#6F6C65" font-size="13" font-weight="600">Runtime Boundary</text>
</g>

<g data-drawio-type="component" data-drawio-role="transformation" data-drawio-id="coordinator">
  <rect x="420" y="160" width="160" height="72" rx="14" fill="#D8E8D8" stroke="#76B985" stroke-width="2"/>
  <text x="500" y="190" fill="#3D3C38" font-size="15" font-weight="600" text-anchor="middle">Coordinator</text>
  <text x="500" y="210" fill="#5F5A54" font-size="12" text-anchor="middle">routes work</text>
</g>

<g data-drawio-type="edge" data-drawio-role="causal-flow" data-drawio-id="trigger-to-coordinator" data-drawio-source="trigger" data-drawio-target="coordinator">
  <path d="M 180 196 C 250 196 330 196 420 196" fill="none" stroke="#9A9991" stroke-width="1.6" marker-end="url(#arrowhead)"/>
  <text x="300" y="182" fill="#6F6C65" font-size="11" font-weight="500" text-anchor="middle">starts run</text>
</g>
```

Recommended roles:

| Runtime Role | Annotation |
| --- | --- |
| Trigger | `data-drawio-role="trigger"` |
| Participant | `data-drawio-role="participant"` |
| Runtime boundary | `data-drawio-role="runtime-boundary"` |
| Carrier | `data-drawio-role="carrier"` |
| Transformation | `data-drawio-role="transformation"` |
| State / Store | `data-drawio-role="state-store"` |
| Observable output | `data-drawio-role="observable-output"` |
| Causal connector | `data-drawio-role="causal-flow"` |

Before implementing runtime-specific editable primitives, read `drawio-authoring.md#component-granularity` because it owns the generic table, multiplicity, marker, and nested-primitive export mechanics. Complete this step only when every applicable runtime primitive is represented or intentionally omitted with a reason.

## Cloudy Visual Mapping

- Triggers use external/generic fills or a compact callout.
- Participants use the existing semantic palette based on what they are.
- Runtime boundaries use neutral soft panels with dashed strokes.
- Carriers can be visible nodes, labeled connectors, or pills depending on whether the carrier itself is important.
- Transformations use compute, backend, security, or process colors based on their work.
- State / Stores use data/storage colors or compact table-like grouped primitives.
- Observable Outputs should be distinct from active transformations and may use neutral artifact boxes, data colors, or scope notes.
