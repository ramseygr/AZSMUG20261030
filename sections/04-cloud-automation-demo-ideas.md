# 4. Cloud Automation Demo Ideas

## Purpose

Collect practical demo scenarios that fit the audience and can be built live or prepared ahead of time.

## Key Message

Cloud automation is a strong use case for Copilot because the work often involves repetitive scripts, command syntax, configuration files, documentation, troubleshooting, and small operational tools.

## Candidate Demos

### Azure Resource Inventory

Build a PowerShell script that lists Azure resources and exports selected fields to CSV.

Good for showing:

- Prompting from a plain-language goal.
- Adding parameters.
- Improving output formatting.
- Adding error handling.
- Generating usage documentation.

### Script Explanation And Risk Review

Provide an existing PowerShell or Azure CLI script and ask Copilot to explain what it does before running it.

Good for showing:

- Code explanation.
- Risk identification.
- Learning unfamiliar commands.
- Human review before execution.

### Troubleshooting A Broken Script

Use a script with a realistic error and ask Copilot to help diagnose the problem.

Good for showing:

- Debugging assistance.
- Terminal output as context.
- Iterative repair.
- Testing after changes.

### Documentation Generation

Ask Copilot to create README content, usage examples, prerequisites, and expected output for a script.

Good for showing:

- Documentation from working code.
- Operational handoff.
- Team readability.

## Recommended Main Demo

Use the Azure Resource Inventory demo as the main throughline because it is practical, read-only, and easy for attendees to understand. It can start simple and then become more realistic through iteration.

## Demo Safety Notes

- Keep demos read-only unless there is a clear reason to modify resources.
- Use a safe subscription, test tenant, or mock data.
- Avoid exposing subscription IDs, tenant IDs, resource names, or sensitive environment details on screen when possible.
- Have a prepared fallback script in case live generation takes an unexpected direction.

## Timing

Target: 10 minutes if used as an overview section, or 20-25 minutes if expanded into the main live demo.