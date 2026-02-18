Implement RFC-007 Priority 2 step 5: Update project_setup to include coding_decisions template.

Read RFC-007: docs/rfcs/RFC-007-methodology-updates-from-coding-practice.md

The template already exists at: templates/coding_decisions_template.md

What needs to happen:
1. When `project_setup` creates a new project, it should also copy `coding_decisions_template.md` into the project root as `coding_decisions.md`
2. This goes alongside the existing copies of methodology/ and rta_config.yaml
3. The template contains placeholder sections that the researcher fills in during coding

Look at how project_setup currently copies methodology files and rta_config.yaml, then add the same pattern for coding_decisions_template.md → coding_decisions.md.

After the change, show me the diff and verify it works by checking the project_setup function.
