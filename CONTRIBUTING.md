# Contributing

Thank you for your interest in contributing to Qualitative Analysis RTA!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Build and verify (`npm run build`)
5. Commit (`git commit -m 'feat: Description of change'`)
6. Push (`git push origin feature/your-feature`)
7. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/tikankika/MPC_RTA.git
cd MPC_RTA
npm install
npm run build
```

## Code Style

- TypeScript with strict mode
- Conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)
- JSDoc comments on public classes and methods

## Reporting Bugs

Open a GitHub Issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node.js version, Claude Desktop version)

## Methodology Contributions

This project implements Braun & Clarke's Reflexive Thematic Analysis. Methodology documents are in `methodology/`. Changes to methodology should be grounded in RTA literature and clearly referenced.

## License

By contributing, you agree that your contributions will be licensed under CC BY-NC-SA 4.0, the same license as the project. See [LICENSE](LICENSE).
