# Run Of Show

The [slide deck](slides/index.html) is the source of truth for slide content
and order. This is the single presenter guide; demo prompt guides contain the
copyable prompts. Use browser slides for framing, VS Code for Copilot, and the
local dashboard for the application walkthrough.

## Timing: 60 Minutes

| Segment | Slides | Time | Presenter cue |
| --- | --- | ---: | --- |
| Welcome, presenter, expectations, and security | 1-5 | 5 min | Different starting points; demos are not production guidance. |
| Why it matters and the vibe coding loop | 6-7 | 4 min | Prompt, draft, review, test, refine, document. |
| Copilot in VS Code | 8 | 4 min | Show inline suggestions, chat, and workspace context. |
| Prompting basics | 9 | 4 min | Goal, context, constraints, output. |
| Cloud automation use cases | 10 | 2 min | Bridge from scripts to simple web apps. |
| Demo 1: explain and improve a script | 11 | 8 min | Explain, identify risks, improve, and document. |
| Demo 2: Intune endpoint dashboard | 12 | 12 min | Sample fleet, compliance drill-down, and iterative refinement. |
| Guardrails | 13 | 2 min | Generated code is a draft. |
| Looking ahead: spec-driven development | 14 | 1 min | Mention the concept; no tooling walkthrough. |
| Next steps and app showcase | 15-16 | 3 min | One small task first; showcase only as time permits. |
| Q&A | 17 | 10 min | Invite audience scenarios. |
| Buffer | Throughout | 5 min | Transitions, questions, and demo delays. |
| **Total** | | **60 min** | **45 prepared + 10 Q&A + 5 buffer** |

If running behind, skip optional demo enhancements and external app visits.
Keep the security framing, guardrails, and Q&A.

## Presenter Setup Checklist

- Open [the deck](slides/index.html); use the Home button or Home key to start.
  Refresh preserves the current slide through its URL fragment.
- Increase VS Code zoom and terminal font size for projector readability.
- Verify Copilot is signed in and responding.
- Open the working [inventory script](demos/azure-resource-inventory/inventory.ps1)
  and its [prompt guide](demos/azure-resource-inventory/demo-prompts.md).
- Keep [rough-inventory.ps1](demos/azure-resource-inventory/rough-inventory.ps1)
  unchanged as the reset source. Follow the [reset instructions](demos/azure-resource-inventory/README.md)
  before the session if needed; the copy overwrites working-script edits.
- Check Azure PowerShell availability and the selected Azure context before
  running the script. Keep real inventory exports and tenant data off screen.
- Follow the [Intune setup guide](demos/intune-dashboard/README.md), start the
  local server, and open http://localhost:3000/?demo=1.
- Verify the sample fleet loads and a compliance category opens its device list.
- Open the [Intune prompt guide](demos/intune-dashboard/demo-prompts.md) in
  Markdown Preview (**Ctrl+Shift+V**) for large-screen reading and copying.
- Test network access to Copilot and the MSAL CDN. Live Graph access additionally
  needs an approved app registration, administrator consent, and user permissions.
- Disable notifications and close unrelated or sensitive browser/editor tabs.

## Opening And Framing: Slides 1-7

- Welcome attendees; the session is beginner-friendly and demo-oriented.
- Acknowledge different AI experience and perspectives. No common starting
  level is assumed.
- Today's AI is a starting point, not the ceiling. This is an expectation of
  progress, not a promise that every update improves every task.
- Examples are for demonstration only. Consult your security team and follow
  organizational policies before using them in your environment.
- Copilot helps draft and explain; the operator supplies intent, context,
  constraints, and judgment.
- Make the loop explicit: prompt, draft, review, test, refine, document.

## Copilot And Prompting: Slides 8-10

- Show where help appears: inline suggestions, chat, selected files, and
  terminal output as context.
- Ask for small, reviewable changes instead of a whole solution at once.
- Use **goal, context, constraints, output**. Compare "write an Azure script"
  with a request for a read-only inventory script and predictable CSV output.
- Ask Copilot to identify assumptions and explain tradeoffs before execution.
- Refer attendees to the [prompt handout](resources/prompt-patterns.md).
- Use cases include inventory, explanation, troubleshooting, documentation,
  and simple web apps. This sets up both demos before switching windows.

## Demo 1: Script Explanation And Improvement

Use the [inventory prompt guide](demos/azure-resource-inventory/demo-prompts.md)
with [inventory.ps1](demos/azure-resource-inventory/inventory.ps1).

1. Ask Copilot to explain the script before changing it.
2. Ask for risks and assumptions: module availability, authentication, target
   subscription, permissions, output path, and error handling.
3. Request one improvement while keeping Azure operations read-only.
4. Inspect the diff and validate the result before running it.
5. If time permits, add comment-based help or generate usage documentation.

Narrate what you check. Show at least one refinement rather than suggesting
the first answer is finished. The script reads Azure resources and writes a
local CSV; it does not create or modify Azure resources.

## Demo 2: Intune Endpoint Dashboard

Use the [dashboard](demos/intune-dashboard/README.md) and its
[step-by-step prompts](demos/intune-dashboard/demo-prompts.md).

1. Start with the sample fleet at http://localhost:3000/?demo=1.
2. Show fleet compliance, OS version mix, and stale devices.
3. Walk through the prompt progression: build the UI, add sign-in, connect
   Graph, then add compliance drill-down.
4. Click **Compliant**, **Noncompliant**, or **Unknown**. Show that the modal's
   device list matches the selected category and count.
5. Demonstrate one or two refinements: stale threshold, device-name search,
   table sorting, or CSV export.
6. Explain the live-data path without requiring a live sign-in on stage.

MSAL handles Microsoft sign-in and token acquisition. The app uses that token
to call Graph, which enforces granted access. The delegated permission is
`DeviceManagementManagedDevices.Read.All`; the user also needs appropriate
Intune access. Browser apps cannot keep a client secret.

Demo mode makes no Graph calls, even when signed in. It still imports MSAL
from the CDN and initializes it, so it is **not an offline fallback**.
The optional refresh-button and attribution-footer prompts are ideas for
further work, not features of the prepared dashboard.

## Guardrails And Looking Ahead: Slides 13-14

- Review generated code before running it; protect secrets, tokens, and data.
- Prefer least privilege and read-only examples. Validate in a safe environment.
- Watch target tenant/subscription, dependency assumptions, pagination,
  throttling, and errors. Speed does not replace operational judgment.
- Vibe coding explores through conversation. Spec-driven development makes
  agreed requirements and acceptance criteria explicit before implementation.
- Exploration can discover requirements; a shared spec helps as scope, risk,
  and team coordination grow. Both still require review and testing.
- Spec-driven development is outside today's scope. Offer
  [GitHub Spec Kit](https://github.com/github/spec-kit) for further exploration.

## Closing And Q&A: Slides 15-17

- Try one repetitive, non-production, inspectable task.
- Explain before changing; build review and testing into the loop.
- Keep a personal prompt library.
- If time permits, open the showcase links:
  [EventPin](https://www.eventpin.net/),
  [Ride Radar](https://rideradar.net/), and
  [Strip Stumble](https://www.stripstumble.com/).
  Strip Stumble was created by a colleague of Greg's, not Greg.
- Ask: "What automation task would you try first?" Follow up with what
  constraints, acceptance checks, or team guardrails it would need.

## Backup Plan

- **Copilot slow or unavailable:** Walk through prepared prompts and existing
  code. Explain how each request changes the result; do not wait indefinitely.
- **Azure unavailable:** Explain the starter script and use
  [mock inventory data](demos/azure-resource-inventory/mock-resource-data.json)
  to discuss the output shape. The starter does not automatically load mock data.
- **Graph access unavailable:** Use the dashboard's sample fleet with `?demo=1`.
- **CDN or MSAL unavailable:** Use the dashboard source and prompt guide instead;
  sample mode still depends on MSAL loading and initializing.
- **External showcase unavailable:** Stay on the showcase slide and describe
  the examples rather than troubleshooting external sites.
