# Maintaining Cloudy Tech Diagrams

This document owns repository maintenance procedures that are unnecessary during ordinary diagram generation. The runtime Agent Skill points only to material shipped in the Release Skill Zip.

## Exporter Version Lock

The Draw.io exporter block is versioned with `CLOUDY_DRAWIO_EXPORTER_VERSION`. When updating generated examples, refresh the full exporter block from the current template instead of editing selected functions. The version-lock tests detect stale or partially copied exporter behavior.

Run the full Node test suite after changing the exporter or any acceptance example:

```text
node --test
```

## Draw.io Visual Regression Gate

Run the Draw.io Visual Regression Gate for release validation after structural completeness, visible-label, sampled-edge, style-mapping, and exporter-version tests pass.

The maintained rendering path is:

1. Render `#report-container` with Playwright Chromium at 1200x900, deviceScaleFactor 1, and a light color scheme after `document.fonts.ready`. Exclude `.toolbar`, `.cards`, and `.footer`.
2. Export the generated `.drawio` file with diagrams.net Desktop CLI: `draw.io --export --format png --output <drawioPng> <drawioFile>`.
3. Compare the HTML and Draw.io PNG files with `node tools/drawio-visual-regression.mjs gate --config <local-gate-config.json>` and `DRAWIO_VISUAL_GATE=1`.

Default thresholds:

- `maxPixelMismatchRatio=0.015`
- `perChannelTolerance=3`
- `maxAverageChannelDelta=2`

Keep the gate configuration local and ignored by git. Browser, diagrams.net, operating-system, and font-rendering versions can make screenshot artifacts flaky, so ordinary CI validates configuration shape and comparator behavior without requiring external screenshots.

Document accepted limitations in the local gate config: font-rendering drift, draw.io-native approximations for marker and dash patterns, and intentional exclusion of toolbar UI, footer metadata, and page-support cards. The pixel gate runs after semantic export tests and never replaces the editable-object contract.

## Adding New Diagram Expression Rules

Add a quality-gate rule only when it generalizes beyond the current project and catches a diagram-level clarity or rendering failure. Use this admission test:

- **Problem it catches:** What misunderstanding, broken connector, overlap, clipping, or layering mistake does it prevent?
- **Why it generalizes:** Why does the same issue apply to other architecture, flow, security, topology, runtime, or deployment diagrams?
- **Rule:** State one concise, observable target behavior.
- **How to verify:** Identify the rendered output, screenshot, export, or SVG structure that proves it.
- **Where it belongs:** Put always-applicable checks under Universal rules and conditional visual patterns under Type-Specific rules.

Keep domain-model correctness, source interpretation, product architecture, vendor terminology, and project-specific component choices in task reasoning or source review rather than the reusable diagram-expression gate.

## Reference Ownership

- `SKILL.md` owns the universal authoring process, mode routing, and product invariants.
- `references/style-references.md` owns the visual system.
- `references/drawio-authoring.md` owns the editable export authoring contract.
- `references/runtime-mechanism-mode.md` owns runtime causal grammar.
- `references/quality-gate.md` owns final expression checks.
- `assets/template.html` owns the executable page shell and versioned exporter implementation.
