# Intune Executive Endpoint Dashboard

Single-page dashboard (plain HTML/CSS/JS) showing fleet compliance, stale devices, and OS version mix.

Use the [live demo prompts](demo-prompts.md) to walk through building the UI,
adding authentication and Graph data, and implementing compliance drill-down.

## Auth

Uses [MSAL.js v4](https://www.npmjs.com/package/@azure/msal-browser) from the jsDelivr CDN as an ES module.

- Entra ID app registration: **Single-page application** platform, redirect URI `http://localhost:3000/`
- Delegated Graph permission: `DeviceManagementManagedDevices.Read.All`
- Public client with auth code + PKCE. **No client secret** — never add one to this repo.

### Configure live access

Consult your security team before using this demo with your environment.

1. Create or use an approved Microsoft Entra app registration with the
   **Single-page application** platform and redirect URI `http://localhost:3000/`.
2. Add the Microsoft Graph **delegated** permission
   `DeviceManagementManagedDevices.Read.All` and obtain administrator consent.
3. In [app.js](app.js), replace `MSAL_CONFIG.auth.clientId` and the tenant ID
   in `MSAL_CONFIG.auth.authority` with your own registration's identifiers.
   The included IDs identify the demo registration; they are not credentials
   and should not be assumed to work for another organization.
4. Ensure the signing-in user has appropriate Intune access as described below.
5. Open http://localhost:3000/ without `?demo=1` to use live data after sign-in.

Do not add a client secret. Do not share access tokens or real device exports
in prompts or commits.

## Run locally

The page must be served from `http://localhost:3000/` (ES modules and the MSAL redirect URI don't work from `file://`):

```powershell
python -m http.server 3000 --bind 127.0.0.1 --directory demos\intune-dashboard
```

Run the command from the repository root with Python installed. Then open
http://localhost:3000/ and allow popups for `localhost`.

Internet access to the jsDelivr CDN is required to load MSAL, even with sample
data. Live access also needs Microsoft sign-in and Graph connectivity.

## Data

- **Signed out:** widgets render from the built-in sample array (`SAMPLE_DEVICES` in `app.js`).
- **Signed in:** `getManagedDevices()` calls `GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices` with `$select` (deviceName, complianceState, lastSyncDateTime, osVersion, plus operatingSystem and userPrincipalName for the OS labels and User column) and `$top=100`, then follows `@odata.nextLink` until there is none.
- **Throttling:** HTTP 429/503 responses wait for `Retry-After` (seconds or HTTP date; exponential backoff if absent) and retry up to 5 times.
- **UI states:** cards dim with a spinner while loading, with page-by-page progress in the status line. On failure, a red banner shows the Graph error with a **Retry** button, and the widgets show "Data unavailable" instead of stale numbers.
- The signed-in user also needs an Intune role that can read devices (e.g. Intune Administrator, Help Desk Operator, or Read Only Operator); the Graph permission alone isn't enough.
- **Stale threshold:** the dropdown in the Stale devices card (7 / 14 / 30 / 60 days, default 30) re-filters the already-loaded device list client-side — no new Graph call.
- **Search:** the box above the cards filters all three widgets (and the compliance drill-down) by device name, case-insensitive substring match. Press `/` to focus it and `Esc` to clear. Client-side only.
- **Sorting:** click any Stale devices column header to sort; click again to reverse. Default is Days (oldest first). Sort order persists while you search or change the threshold.
- **Export CSV:** the button in the Stale devices header downloads exactly the rows currently shown (search + threshold + sort applied) as `stale-devices-<N>d[-<search>]-<date>.csv`. Columns: Device, User, OS, Compliance, Last sync (UTC, ISO 8601), Days since sync. The file is UTF-8 with BOM for Excel; values starting with `= + - @` are prefixed with `'` to prevent spreadsheet formula injection. Generated in-browser — nothing is uploaded.

## Demo mode

Open http://localhost:3000/?demo=1 to always render the 14-device sample fleet, even when signed in. It's handy for presenting stale devices and a varied OS mix with a small tenant. A **Demo** badge appears in the header, and no Graph call is made.

This is not an offline mode: the app still imports MSAL from the CDN and
initializes it before rendering the sample fleet.

## Compliance drill-down

Click **Compliant**, **Noncompliant**, or **Unknown** in the Fleet compliance card, or tab to it and press Enter. A dialog lists the matching devices with their user, OS, raw Intune compliance state, and last sync. Close it with ×, Esc, or a click outside the dialog. Buckets with zero devices are disabled.

## Optional follow-up ideas

The [prompt guide](demo-prompts.md) includes enhancements to try live.
The prepared app already includes thresholds, search, sorting, CSV export,
empty states, and day-based last-sync ages. A dedicated refresh button,
hour-level relative times, and a repository/permission attribution footer
are follow-up ideas, not implemented features.
