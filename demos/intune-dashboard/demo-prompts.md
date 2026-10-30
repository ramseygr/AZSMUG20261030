# Intune Dashboard: Live Demo Prompts

**Build the UI → Add sign-in → Connect data → Drill down → Refine**

Copy one prompt block at a time into Copilot. Review and test each result
before moving to the next step.

> **Demo only:** Consult your security team before connecting to your environment.
> Never include client secrets in prompts or source code.

---

## 1. Build the dashboard

**Goal:** Start with a working layout and sample data.

```text
Create index.html, styles.css, and app.js for a single-page
executive endpoint dashboard.

Use plain HTML/CSS/JS: no frameworks, no build step.
Use dark, modern admin-console styling.

Layout:
- A header with a title and a Sign in / Sign out button.
- Fleet compliance: counts of compliant / noncompliant / unknown devices.
- Stale devices: a table of devices that haven't synced in 30 days.
- OS version mix: a breakdown of devices by OS version.

All data should come from functions I'll wire to Microsoft Graph
in the next step. For now, render the widgets from a local sample
array so I can see the layout.
```

---

## 2. Add sign-in

**Goal:** Authenticate with MSAL.js, without a client secret.

```text
Now wire up real authentication in app.js using MSAL.js v4.

Import it as an ES module from this CDN URL:
https://cdn.jsdelivr.net/npm/@azure/msal-browser@4/+esm

Use PublicClientApplication with these settings:
- Ask me for the client ID and tenant ID. Don't invent them.
- Authority: https://login.microsoftonline.com/<tenant-id>
- Redirect URI: http://localhost:3000/ for local development.
- Request exactly one scope:
  DeviceManagementManagedDevices.Read.All

Use loginPopup, then acquireTokenSilent with popup fallback.

MSAL.js v4 requires await msalApp.initialize() before any other call.
No client secret exists and none should ever appear in this repo.
```

---

## 3. Connect Microsoft Graph

**Goal:** Load real device data with pagination and clear status messages.

```text
Replace the sample data with a real Microsoft Graph call:

GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices

Query parameters:
- $select=deviceName,complianceState,lastSyncDateTime,osVersion
- $top=100

Handle pagination via @odata.nextLink.
Keep following it until there's no nextLink.

Handle HTTP 429 with Retry-After backoff.
Feed the full device list into the three widgets.

Show a loading state while fetching and a clear error message
if the call fails.
```

---

## 4. Add compliance drill-down

**Goal:** Click a compliance category to see the devices behind the count.

```text
Make "Compliant", "Noncompliant", and "Unknown" in the Fleet
compliance widget clickable buttons.

Clicking a category should open a modal dialog containing only
the devices in that category, sorted by device name.
Use the same compliance grouping as the widget so the list
matches the count. Use already-loaded data, not another Graph call.

Show the category name, device count, and a table with:
- Device name
- User
- OS and version
- Original Intune compliance state
- Last sync

Include operatingSystem and userPrincipalName in the Graph
$select fields so the OS and User columns have data.

Use a native HTML dialog with a labeled Close button.
Allow closing with Escape or a click outside the dialog.
Make the category buttons keyboard-accessible and disable
categories with zero devices.

If a device-name search filter exists, apply it to both the
widget counts and the dialog list.
```

---

## 5. Refine with small follow-up prompts

**Pick one enhancement at a time. Review, test, then refine.**

The prepared dashboard already includes thresholds, search, sorting, CSV
export, empty states, and day-based last-sync ages. These prompts show how
to build those features incrementally. A refresh button, hour-level relative
times, and the attribution footer remain optional follow-up ideas.

### A. Stale-device threshold

```text
Add a dropdown to the stale devices widget letting me choose
7 / 14 / 30 / 60 days, re-filtering the table without re-fetching.
```

### B. Search and sort

```text
Add a search box that filters all three widgets by device name,
and make the stale-devices table sortable by clicking column headers.
```

### C. Relative times and polish

```text
Show last-sync as relative time ('2h ago', '3d ago').
Add a refresh button that re-fetches without re-signing-in.
Add an empty-state message when a widget has no data.
```

### D. CSV export

```text
Add an 'Export CSV' button on the stale devices table
that downloads the currently filtered rows.
```

### E. The honest footer

```text
Add a small footer noting the data source (Microsoft Graph, read-only),
the permission in use, and a link to the repo.
```