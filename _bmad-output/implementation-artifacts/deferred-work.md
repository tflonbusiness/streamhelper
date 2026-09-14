- source_spec: `_bmad-output/implementation-artifacts/spec-simple-web-page.md`
  summary: Narrow-viewport overflow is only checked by CSS substrings, not a ~375px browser viewport.
  evidence: `verify-page.mjs` greps `min(36rem, 100%)` and `overflow-wrap`; a `min-width` that overflows at 375px would still pass. A real viewport measurement would settle it; this change has no browser test stack.
