# Presentation Approach

## Chosen Recommendation

Use a hybrid format: a small number of polished HTML slides for structure, then switch into Visual Studio Code for live demos. This keeps the talk visually clean while making the core experience feel real and practical.

## Why Hybrid Works Well

- Slides give the audience a clear path through the session.
- VS Code demos show the actual workflow instead of only describing it.
- HTML slides are easy to keep in the same workspace as the demos and notes.
- You can version the whole talk as code.
- The session can feel more modern and connected to the topic than a traditional PowerPoint.

## Suggested Flow

1. Start with slides for the title, audience framing, and core workflow.
2. Switch to VS Code for the first Copilot walkthrough.
3. Return to slides for prompting patterns and guardrails.
4. Switch back to VS Code for the main cloud automation demo.
5. End with slides for recap, next steps, and Q&A.

## Slide Deck Options

### Option A: Simple HTML Slides

Create a standalone `index.html` with sections that behave like slides. This is lightweight, portable, and easy to present in a browser.

Best when:

- You want full control without adding a framework.
- You want the deck to live directly in the repo.
- You want something that opens locally without a build step.

### Option B: Reveal.js

Use Reveal.js for a more complete HTML presentation framework with keyboard navigation, speaker notes, themes, fragments, and export options.

Best when:

- You want a polished browser-based slide experience.
- You want speaker notes.
- You may reuse this deck later.

### Option C: Marp Markdown Slides

Use Marp to write slides in markdown and present or export them.

Best when:

- You want markdown-first slides.
- You want fast editing in VS Code.
- You may export to PDF or PowerPoint later.

### Option D: Present Mostly From VS Code

Use markdown preview, prepared files, and demos directly from the workspace.

Best when:

- You want the session to feel like a live workshop.
- You are comfortable navigating files during the talk.
- You want fewer transitions between slides and demos.

## Recommended Structure For This Session

- Use 10-12 slides total.
- Keep slides visual and sparse.
- Put detailed speaker notes in markdown section files.
- Put demo scripts in a `demos/` folder.
- Put finished handouts or references in a `resources/` folder.

## Proposed Slide List

1. Title: GitHub Copilot 101 with Cloud Automation
2. Why this matters for cloud and systems work
3. What "vibe coding" means in practice
4. Copilot in VS Code: where it shows up
5. Prompt pattern: goal, context, constraints, output
6. Demo 1: explain and improve a script
7. Cloud automation use cases
8. Demo 2: build an Azure inventory helper
9. Review habits and guardrails
10. What to try next
11. Q&A

## Visual Style Ideas

- Use a clean, high-contrast theme that works on projectors.
- Use screenshots sparingly; live VS Code should carry most of the product visuals.
- Use simple diagrams for workflows rather than dense bullets.
- Keep code snippets large and short.
- Use one accent color that feels Azure-adjacent, but avoid turning the whole deck into a wall of blue.

## Workspace Structure To Build Toward

```text
session-plan.md
presentation-approach.md
sections/
  01-welcome-and-framing.md
  02-copilot-in-vscode.md
  03-prompting-basics.md
  04-cloud-automation-demo-ideas.md
  05-live-vibe-coding-flow.md
  06-responsible-use-and-guardrails.md
  07-wrap-up.md
slides/
  index.html
demos/
  azure-resource-inventory/
resources/
  prompt-patterns.md
```

## Current Build Step

The lightweight HTML slide deck now lives in `slides/index.html`. The next layer is the live demo kit under `demos/azure-resource-inventory/` and reusable attendee prompts under `resources/`.