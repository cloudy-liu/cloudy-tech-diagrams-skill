# Skill Evaluation Corpus

`evals.json` is a reusable prompt corpus for comparing Cloudy Tech Diagrams behavior across agent and model tiers. Prompts are intentionally stable; do not add model-specific instructions or change the prompts between runs. The `prompt_manifest` stores SHA-256 fingerprints for every prompt. If a prompt must change, increment the corpus `version` and regenerate the manifest in the same change.

The `technical-diagram-default` objective profile supplies the shared artifact, export, annotation, connector, and unavailable-check contract once. Each positive case adds only scenario-specific source or role assertions. Their `human_review` entries cover information selection, layout quality, and visual clarity; those judgments are not reduced to string-presence assertions.

The `routing-near-miss` profile covers adjacent work that should not invoke this skill. The corpus includes dashboard, marketing landing page, generic deck, and non-technical illustration near-misses.

`schema.json` defines the record shape and explicit routing intent. The repository contract test validates the schema-facing fields, prompt fingerprints, required scenario coverage, profile expansion, positive-case assertion content, near-miss routing, multilingual input, and the separation between objective expectations and human review.
