# Demo Prompts

Use `inventory.ps1` as the script context for these prompts and make all script
edits there. Leave `rough-inventory.ps1` unchanged so it remains the reset source.

## 1. Explain The Script

```text
Explain what this PowerShell script does. Call out any assumptions
it makes and anything I should verify before running it in an
Azure environment. Also suggest a clearer, descriptive filename
for this script and explain why it would be a better name.
```

## 2. Summarize And Copy The Script

```text
Give me a brief summary of the script, then copy inventory.ps1
to the recommended filename from the previous step. Do not change
the script contents or overwrite an existing file. Leave inventory.ps1 unchanged.
```

## 3. Review For Risk

```text
Review this script for cloud operations risk. Confirm whether it is
read-only, identify any missing safeguards, and suggest improvements
for running it safely during a demo.
```

## 4. Improve The Script

```text
Improve this script for an operations team. Keep it read-only.
Add optional SubscriptionId and ResourceGroupName parameters,
basic validation, clearer progress messages, error handling,
and predictable CSV output.
```

## 5. Add Help

```text
Add PowerShell comment-based help to this script, including
synopsis, description, parameters, examples, and notes.
Do not change the script behavior.
```

## 6. Generate Documentation

```text
Create a README section for this script with prerequisites, setup,
examples, expected output columns, and safety notes.
```

## 7. Ask For A Better Prompt

```text
Rewrite my prompt so it gives Copilot better context for generating
a safe Azure PowerShell inventory script for a user group demo.
```
