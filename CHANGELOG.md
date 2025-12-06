# Changelog

All notable changes to Phase 1 Coding MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Multi-segment API for `code_write_segment` (#001)
  - Write multiple small segments in one operation
  - Granular coding support for specific line ranges
  - Auto-sorting and overlap validation
  - Backwards compatible with v0.1.0 single-segment API

### Changed
- Enhanced `code_write_segment` input schema (supports both old and new modes)

---

## [0.1.0] - 2025-12-05

### Added
- Initial MVP release
- Core tools: `code_start`, `code_read_next`, `code_write_segment`, `code_status`, `add_line_numbers`
- STATUS tracking via YAML frontmatter
- Segment markers (`/segment`, `/slut_segment`)
- Complete API documentation (API.md, USER_GUIDE.md, README.md)
- TypeScript implementation with MCP SDK
- Segment-based reading and writing for memory-efficient coding

### Technical Details
- Server handles file operations only (methodology-agnostic)
- Fixed 80-line segment size
- Read-entire/write-entire file pattern
- 4-digit line numbering (0001-9999)

---

## Design Documents

- [#001: Multi-Segment API](docs/design/001-multi-segment-api.md) - Granular segment coding feature
