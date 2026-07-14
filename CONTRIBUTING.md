# Contributing

Keep pull requests focused and add tests for changed ingestion, normalization, or query behavior.

Run the project checks before submitting:

```bash
npm ci
npm run build
npm test -- --runInBand
npm audit --omit=dev
```

Never use live exchange credentials in tests.
