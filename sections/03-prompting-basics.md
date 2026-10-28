# 3. Prompting Basics For Useful Results

## Purpose

Give attendees a simple prompting model they can reuse during and after the session.

## Key Message

Good Copilot results usually come from giving clear intent, relevant context, constraints, and a specific output format. The prompt does not need to be fancy; it needs to be useful.

## Prompt Pattern

Use this structure when asking Copilot for help:

```text
Goal: What I want to accomplish.
Context: What environment, tool, language, or file this involves.
Constraints: What must or must not happen.
Output: What I want back.
```

## Example

```text
Goal: Create a PowerShell script that lists Azure resource groups and exports the result.
Context: I use Azure PowerShell and want to run this from VS Code.
Constraints: Do not delete or modify resources. Include basic error handling.
Output: Give me a script with parameters and usage examples.
```

## Talking Points

- Start with the outcome, not just the tool name.
- Include the operating environment: PowerShell, Azure CLI, Bicep, YAML, Bash, Python, or another context.
- State safety constraints clearly for cloud work.
- Ask for small steps when the task is unfamiliar.
- Ask Copilot to explain assumptions before generating code for risky operations.
- Iterate by saying what is wrong or missing from the first draft.

## Bad Prompt / Better Prompt

Bad:

```text
Write me an Azure script.
```

Better:

```text
Create a read-only Azure PowerShell script that lists all virtual machines in a subscription, including name, resource group, location, power state, and size. Add parameters for subscription ID and output path, and export the results to CSV.
```

## Demo Ideas

- Show the difference between a vague prompt and a specific prompt.
- Ask Copilot to improve a prompt before writing code.
- Ask Copilot to list questions it would need answered before generating a production-ready script.

## Timing

Target: 8-10 minutes.