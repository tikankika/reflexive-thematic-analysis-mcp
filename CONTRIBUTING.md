# Contributing

Thank you for your interest in contributing to the Reflexive Thematic Analysis MCP Server.

## How to contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Build and verify (`npm run build`)
5. Commit (`git commit -m 'feat: Description of change'`)
6. Push (`git push origin feature/your-feature`)
7. Open a Pull Request

## Development setup

```bash
git clone https://github.com/tikankika/reflexive-thematic-analysis-mcp.git
cd reflexive-thematic-analysis-mcp
npm install
npm run build
```

## Project structure

The project separates three concerns, and contributions should respect this separation:

- **`src/`** — Tool infrastructure. Handles file operations, progress tracking, and session management. Methodology-agnostic.
- **`methodology/`** — Analytical framework. Epistemological foundations and phase-specific guidance for Braun & Clarke's RTA. Changes here should be grounded in qualitative methodology literature.
- **`protocols/`** — Coding conventions. Project-specific rules for code formatting, research question mapping, and language. The included protocols are examples; researchers create their own.

## Code style

- TypeScript with strict mode
- Conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)
- All user-facing text in English (methodology documents may reference non-English research contexts)

## Reporting bugs

Open a GitHub Issue with:

- Description of the problem
- Steps to reproduce
- Expected versus actual behaviour
- Environment (OS, Node.js version, Claude Desktop version)

## Methodology contributions

The methodology suite implements Braun & Clarke's Reflexive Thematic Analysis (2006, 2022), adapted for dialogic analysis. Proposed changes to methodology documents should reference relevant RTA literature and explain how the change addresses a genuine analytical concern. The methodology is opinionated by design — it takes clear positions grounded in the literature rather than offering neutral summaries.

## License

By contributing, you agree that your contributions will be licensed under CC BY-NC-SA 4.0, the same license as the project. See [LICENSE](LICENSE).
