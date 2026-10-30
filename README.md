# Vibe Coding 101: GitHub Copilot, VS Code, and the Future of Cloud Automation

Materials for the Arizona Systems Management User Group session on October 30, 2026.

## Contents

- [Slide deck](slides/index.html): Standalone, 17-slide browser presentation. No build step is required.
- [Session plan](session-plan.md): Abstract, objectives, and session scope.
- [Run of show](run-of-show.md): Current presenter guide, timing, talking points, setup, and fallback plans.
- [Azure inventory demo](demos/azure-resource-inventory/README.md): Rough PowerShell starter, prepared prompts, and mock data.
- [Intune dashboard demo](demos/intune-dashboard/README.md): Setup, authentication, and dashboard features.
- [Intune demo prompts](demos/intune-dashboard/demo-prompts.md): Copyable prompts for building and refining the dashboard.
- [Prompt patterns](resources/prompt-patterns.md): Reusable attendee prompts.

## Presenting

Open [the slide deck](slides/index.html) directly in a browser.

- Use Left/Right arrows, Page Up/Page Down, or Space (forward) to navigate.
- Swipe left or right on a touchscreen to move between slides.
- Use the Home key or the home icon beside the progress bar to return to slide 1.
- Use End to jump to the final slide.
- The URL fragment stores the current slide, so refreshing preserves your position.

The deck is the source of truth for slide content and order. The
[run of show](run-of-show.md) is the single presenter-notes document.

For the Intune demo, run this from the repository root with Python installed:

```powershell
python -m http.server 3000 --bind 127.0.0.1 --directory demos\intune-dashboard
```

Open http://localhost:3000/?demo=1 for the sample fleet without Graph calls.
Internet access is still required for the MSAL CDN import. See the
[dashboard setup guide](demos/intune-dashboard/README.md) before using live data.
Use **Ctrl+Shift+V** in VS Code to preview the Markdown prompt guides.

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

The dashboard currently contains demo app-registration client and tenant IDs.
These are public identifiers, not credentials; use your own approved registration
for live access. Never add a client secret or access token to the repository.

The inventory scripts require Azure PowerShell and an authenticated Azure context.
Review the target subscription before running it. It lists resources and writes a
local CSV; demos should remain read-only against Azure.
