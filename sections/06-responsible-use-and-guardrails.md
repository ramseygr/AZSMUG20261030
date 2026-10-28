# 6. Responsible Use And Practical Guardrails

## Purpose

Make sure the session balances excitement with sound operational judgment.

## Key Message

Copilot can make you faster, but it does not remove your responsibility to understand what code does, protect secrets, use least privilege, and test safely.

## Guardrails To Emphasize

- Review generated code before running it.
- Watch for commands that create, update, delete, restart, or reconfigure resources.
- Do not paste secrets, passwords, private keys, tokens, or customer-sensitive data into prompts.
- Use read-only examples when learning or presenting.
- Test in a sandbox before using scripts in production.
- Validate generated commands against official documentation when the operation matters.
- Keep human approval in the loop for destructive or production-impacting changes.

## Cloud-Specific Risks

- Accidentally targeting the wrong subscription, tenant, or resource group.
- Running commands with broader permissions than intended.
- Copying generated code that lacks paging, error handling, or throttling awareness.
- Generating scripts that assume a module, extension, or CLI version that is not installed.
- Logging sensitive values to console, files, or shared output.

## Suggested Talking Point

"The faster the tool helps us move, the more important our review habits become. Copilot can help draft the script, but it cannot know your change window, your production risk, your approval process, or your tenant boundaries unless you bring that context into the workflow."

## Demo Ideas

- Ask Copilot to review a script for risky operations.
- Ask Copilot to rewrite a prompt to make it safer and read-only.
- Show how adding constraints changes the generated result.

## Timing

Target: 7-8 minutes.