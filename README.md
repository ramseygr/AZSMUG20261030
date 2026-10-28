# Vibe Coding 101: GitHub Copilot, VS Code, and the Future of Cloud Automation

Materials for the Arizona Systems Management User Group session on October 30, 2026.

## Contents

- [Slide deck](slides/index.html): Open locally in a browser; use the arrow keys to navigate. No build step is required.
- [Session plan](session-plan.md): Abstract, objectives, and outline.
- [Run of show](run-of-show.md): Presenter flow and setup checklist.
- [Speaker notes](sections/): Section-by-section talking points.
- [Azure inventory demo](demos/azure-resource-inventory/README.md): Rough PowerShell starter, prepared prompts, and mock data.
- [Prompt patterns](resources/prompt-patterns.md): Reusable attendee prompts.

## Demo baseline and resets

The `demo-baseline` Git tag marks the initial presentation and demo materials.
Commit useful enhancements separately from slide and speaker-note updates so
individual demo changes are easy to review.

Keep [rough-inventory.ps1](demos/azure-resource-inventory/rough-inventory.ps1)
unchanged as the starter. Use [inventory.ps1](demos/azure-resource-inventory/inventory.ps1)
for all live demo edits and enhancements.

To reset only the working demo script, run the following from the repository root:

```powershell
git diff -- demos/azure-resource-inventory/inventory.ps1
Copy-Item -LiteralPath .\demos\azure-resource-inventory\rough-inventory.ps1 -Destination .\demos\azure-resource-inventory\inventory.ps1 -Force
```

The copy command overwrites the working script with the starter.
Commit or copy any enhancements you want to keep first. It does not reset slides, notes,
the Git index, generated exports, or Azure resources.

## Public repository safety

Keep credentials, tenant-specific information, and real resource inventory exports
out of commits. Generated CSV files, local environment files, private key files,
and local Azure Developer CLI state are ignored by Git. The included mock data
uses demo resource names.

The inventory scripts require Azure PowerShell and an authenticated Azure context.
Review the target subscription before running it. It lists resources and writes a
local CSV; demos should remain read-only against Azure.
