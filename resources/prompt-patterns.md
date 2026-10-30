# Prompt Patterns For Cloud Automation And Simple Web Apps

## Core Pattern

```text
Goal: What I want to accomplish.
Context: The tool, language, file, cloud service, or environment.
Constraints: What must or must not happen.
Output: The format I want back.
```

## Script Generation

```text
Goal: Create a script that inventories Azure resources and exports the result.
Context: Use Azure PowerShell in Visual Studio Code for a user group demo.
Constraints: Keep it read-only. Do not create, update, or delete resources. Include basic error handling.
Output: Return a PowerShell script with parameters, comments, and usage examples.
```

## Script Explanation

```text
Explain this script section by section. Identify the Azure commands it uses, what permissions it likely requires, whether it changes anything, and what I should verify before running it.
```

## Simple Web App

```text
Goal: Build a single-page endpoint dashboard.
Context: Use plain HTML, CSS, and JavaScript with local sample data.
Constraints: No frameworks, build step, credentials, or live API calls.
Output: Three files showing fleet compliance, stale devices, and OS versions.
```

Start with sample data, review the interface, and add authentication and live
data only after confirming the approved permissions and security requirements.

## Troubleshooting

```text
I ran this command and got the error below. Explain the likely cause, ask any clarifying questions that matter, and suggest the safest next troubleshooting steps.
```

## Refactoring

```text
Refactor this script for readability and operational use. Keep the behavior the same unless you call out a recommended change first. Improve names, parameters, validation, and output formatting.
```

## Documentation

```text
Create documentation for this script. Include prerequisites, required permissions, setup, examples, expected output, safety notes, and common troubleshooting tips.
```

## Safety Review

```text
Review this code as if it will be run by a cloud operations team. Identify risky commands, assumptions, missing validation, secret-handling concerns, and production-readiness gaps.
```

## Prompting Tips

- Include the cloud tool you want to use: Azure PowerShell, Azure CLI, Bicep, Terraform, YAML, Python, or another tool.
- Say whether the task should be read-only.
- Name the target audience for the output.
- Ask for assumptions and risks before running generated commands.
- Iterate in small steps instead of asking for a huge finished solution all at once.