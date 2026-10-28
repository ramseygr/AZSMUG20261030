# Run Of Show

## Presentation Format

Use the hybrid approach:

- Browser-based HTML slides for structure and transitions.
- Visual Studio Code for Copilot walkthroughs and live demos.
- Markdown section files as speaker notes and backup material.

## Target Length

Plan for a 60-minute user group session:

- 45 minutes of prepared content and demos.
- 10 minutes of Q&A.
- 5 minutes of buffer for transitions, setup, and audience questions during demos.

## Session Flow

| Segment | Format | Time | Files |
| --- | --- | ---: | --- |
| Title and framing | Slides | 5 min | `slides/index.html`, `sections/01-welcome-and-framing.md` |
| Copilot in VS Code overview | Slides + VS Code | 8 min | `sections/02-copilot-in-vscode.md` |
| Prompting basics | Slides | 8 min | `sections/03-prompting-basics.md`, `resources/prompt-patterns.md` |
| Demo 1: explain and improve a script | VS Code | 8 min | `demos/azure-resource-inventory/inventory.ps1` |
| Cloud automation scenarios | Slides | 5 min | `sections/04-cloud-automation-demo-ideas.md` |
| Demo 2: build the inventory helper | VS Code | 15 min | `demos/azure-resource-inventory/demo-prompts.md` |
| Guardrails | Slides | 6 min | `sections/06-responsible-use-and-guardrails.md` |
| Wrap-up and next steps | Slides | 5 min | `sections/07-wrap-up.md` |

## Transition Notes

- Keep the slide deck open in a browser.
- Keep VS Code open to this workspace with the Explorer visible.
- Use the demo transition slides as a cue to switch windows.
- After each demo, return to the slide deck to reset the audience context.
- Keep a terminal open, but avoid running commands that require production access during the first pass.

## Presenter Setup Checklist

- Browser opened to `slides/index.html`.
- VS Code zoom level increased for projector readability.
- Copilot Chat visible and signed in.
- Terminal font size increased.
- Demo files opened in editor tabs.
- Use `demos/azure-resource-inventory/inventory.ps1` for live script edits; keep `rough-inventory.ps1` unchanged as the reset source.
- Any Azure tenant, subscription, or resource names hidden or sanitized.
- Backup demo prompts available in `demos/azure-resource-inventory/demo-prompts.md`.

## Backup Plan

If live Copilot generation is slow or the network is unreliable, use the prepared prompts and rough script as the demo material. Walk through how you would ask Copilot to explain, improve, and document the script, then show the expected shape of the result verbally.