import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from "https://cdn.jsdelivr.net/npm/@azure/msal-browser@4/+esm";

// Public SPA app registration — client ID and tenant ID are not secrets.
// No client secret is used (or allowed) in this repo.
const MSAL_CONFIG = {
  auth: {
    clientId: "ed9257ae-021d-4b66-869f-daef6a24fed9",
    authority: "https://login.microsoftonline.com/8f0a670f-cf43-4ab7-a2eb-8b57d6f59bc1",
    redirectUri: "http://localhost:3000/",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

const LOGIN_REQUEST = {
  scopes: ["DeviceManagementManagedDevices.Read.All"],
};

const msalApp = new PublicClientApplication(MSAL_CONFIG);

const STALE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Sample data — shaped like Microsoft Graph managedDevice objects
// (GET /deviceManagement/managedDevices) so the Graph swap is a drop-in.
// ---------------------------------------------------------------------------
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS).toISOString();

const SAMPLE_DEVICES = [
  { id: "1",  deviceName: "FIN-LT-0012", userPrincipalName: "alex@contoso.com",   operatingSystem: "Windows", osVersion: "10.0.26100.2314", complianceState: "compliant",    lastSyncDateTime: daysAgo(1) },
  { id: "2",  deviceName: "FIN-LT-0044", userPrincipalName: "priya@contoso.com",  operatingSystem: "Windows", osVersion: "10.0.26100.2314", complianceState: "compliant",    lastSyncDateTime: daysAgo(0) },
  { id: "3",  deviceName: "HR-LT-0101",  userPrincipalName: "sam@contoso.com",    operatingSystem: "Windows", osVersion: "10.0.22631.4460", complianceState: "noncompliant", lastSyncDateTime: daysAgo(42) },
  { id: "4",  deviceName: "ENG-MBP-07",  userPrincipalName: "jordan@contoso.com", operatingSystem: "macOS",   osVersion: "15.1",            complianceState: "compliant",    lastSyncDateTime: daysAgo(2) },
  { id: "5",  deviceName: "ENG-MBP-11",  userPrincipalName: "taylor@contoso.com", operatingSystem: "macOS",   osVersion: "14.7.1",          complianceState: "unknown",      lastSyncDateTime: daysAgo(67) },
  { id: "6",  deviceName: "iPhone-Exec01", userPrincipalName: "ceo@contoso.com",  operatingSystem: "iOS",     osVersion: "18.1",            complianceState: "compliant",    lastSyncDateTime: daysAgo(0) },
  { id: "7",  deviceName: "iPhone-Sales22", userPrincipalName: "morgan@contoso.com", operatingSystem: "iOS",  osVersion: "17.6.1",          complianceState: "noncompliant", lastSyncDateTime: daysAgo(35) },
  { id: "8",  deviceName: "Pixel-Ops03", userPrincipalName: "casey@contoso.com",  operatingSystem: "Android", osVersion: "15",              complianceState: "compliant",    lastSyncDateTime: daysAgo(4) },
  { id: "9",  deviceName: "Galaxy-Ops09", userPrincipalName: "riley@contoso.com", operatingSystem: "Android", osVersion: "14",              complianceState: "unknown",      lastSyncDateTime: daysAgo(91) },
  { id: "10", deviceName: "OPS-DT-0200", userPrincipalName: "drew@contoso.com",   operatingSystem: "Windows", osVersion: "10.0.19045.5131", complianceState: "noncompliant", lastSyncDateTime: daysAgo(120) },
  { id: "11", deviceName: "MKT-LT-0030", userPrincipalName: "jamie@contoso.com",  operatingSystem: "Windows", osVersion: "10.0.22631.4460", complianceState: "compliant",    lastSyncDateTime: daysAgo(6) },
  { id: "12", deviceName: "MKT-LT-0031", userPrincipalName: "quinn@contoso.com",  operatingSystem: "Windows", osVersion: "10.0.26100.2314", complianceState: "compliant",    lastSyncDateTime: daysAgo(12) },
  { id: "13", deviceName: "LEGAL-LT-05", userPrincipalName: "avery@contoso.com",  operatingSystem: "Windows", osVersion: "10.0.26100.2314", complianceState: "compliant",    lastSyncDateTime: daysAgo(3) },
  { id: "14", deviceName: "ENG-MBP-15",  userPrincipalName: "reese@contoso.com",  operatingSystem: "macOS",   osVersion: "15.1",            complianceState: "compliant",    lastSyncDateTime: daysAgo(1) },
];

// ---------------------------------------------------------------------------
// Auth (MSAL.js v4) + data layer
// ---------------------------------------------------------------------------
const state = {
  signedIn: false,
  account: null,
  devices: [],
  dataReady: false,
  staleDays: STALE_DAYS,
  search: "",
  staleSort: { key: "days", dir: "desc" },
  staleRows: [], // exactly what the stale table currently shows (filtered + sorted)
};

// ?demo=1 forces the built-in sample fleet even when signed in (useful for presenting with a small tenant).
const DEMO_MODE = ["1", "true", "yes", ""].includes(
  (new URLSearchParams(location.search).get("demo") ?? "off").toLowerCase()
);

/** Initialize MSAL (required in v4 before any other call) and restore a cached account. */
async function initAuth() {
  await msalApp.initialize();
  const accounts = msalApp.getAllAccounts();
  if (accounts.length) {
    msalApp.setActiveAccount(accounts[0]);
    state.account = accounts[0];
    state.signedIn = true;
  }
}

/** Interactive sign-in via popup. Returns the signed-in account. */
async function signIn() {
  const result = await msalApp.loginPopup(LOGIN_REQUEST);
  msalApp.setActiveAccount(result.account);
  return result.account;
}

/** Sign out via popup and clear the local MSAL cache for the account. */
async function signOut() {
  const account = msalApp.getActiveAccount();
  await msalApp.logoutPopup({ account, mainWindowRedirectUri: MSAL_CONFIG.auth.redirectUri });
}

/** Get a Graph access token: silent first, popup fallback when interaction is required. */
async function getAccessToken() {
  const account = msalApp.getActiveAccount();
  if (!account) throw new Error("Not signed in");
  const request = { ...LOGIN_REQUEST, account };
  try {
    return (await msalApp.acquireTokenSilent(request)).accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      return (await msalApp.acquireTokenPopup(request)).accessToken;
    }
    throw err;
  }
}

// Spec fields plus userPrincipalName/operatingSystem, which the stale-devices User column
// and the OS mix labels ("Windows 10.0.26100…" rather than a bare build number) rely on.
const GRAPH_DEVICES_URL =
  "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices" +
  "?$select=deviceName,complianceState,lastSyncDateTime,osVersion,operatingSystem,userPrincipalName" +
  "&$top=100";
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Parse Retry-After (delta-seconds or HTTP-date) into ms; null if absent/invalid. */
function retryAfterMs(header) {
  if (!header) return null;
  const secs = Number(header);
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

/** GET a Graph URL with a bearer token; on 429/503 waits per Retry-After (exponential fallback) and retries. */
async function graphGet(url, token, onWait) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
      const waitMs = retryAfterMs(res.headers.get("Retry-After")) ?? 2 ** attempt * 1000;
      onWait?.(waitMs, res.status);
      await sleep(waitMs);
      continue;
    }
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json())?.error?.message || "";
      } catch { /* non-JSON body */ }
      throw new Error(`Microsoft Graph returned ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }
    return res.json();
  }
}

/**
 * Fetch managed devices: live from Graph when signed in (following @odata.nextLink until
 * exhausted), sample data otherwise. onProgress(message) reports paging/throttling status.
 */
async function getManagedDevices(onProgress) {
  if (DEMO_MODE) return { devices: SAMPLE_DEVICES, source: "Demo mode · sample data" };
  if (!state.signedIn) return { devices: SAMPLE_DEVICES, source: "Sample data" };

  const token = await getAccessToken();
  const devices = [];
  let url = GRAPH_DEVICES_URL;
  let page = 0;
  while (url) {
    page++;
    const body = await graphGet(url, token, (ms, status) =>
      onProgress?.(`Throttled by Graph (${status}); retrying in ${Math.ceil(ms / 1000)}s…`)
    );
    devices.push(...(body.value || []));
    onProgress?.(`Loading devices… ${devices.length} so far (page ${page})`);
    url = body["@odata.nextLink"];
  }
  return { devices, source: "Live · Microsoft Intune" };
}

// ---------------------------------------------------------------------------
// Transforms (pure functions — reusable with live Graph data)
// ---------------------------------------------------------------------------
function normalizeCompliance(stateValue) {
  const s = String(stateValue || "").toLowerCase();
  if (s === "compliant") return "compliant";
  if (s === "noncompliant" || s === "ingraceperiod" || s === "conflict" || s === "error") return "noncompliant";
  return "unknown";
}

function getComplianceSummary(devices) {
  const counts = { compliant: 0, noncompliant: 0, unknown: 0 };
  for (const d of devices) counts[normalizeCompliance(d.complianceState)]++;
  return counts;
}

function daysSince(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t) || t <= 0) return Infinity;
  return Math.floor((Date.now() - t) / DAY_MS);
}

function getStaleDevices(devices, thresholdDays = STALE_DAYS) {
  return devices
    .map((d) => ({ ...d, daysSinceSync: daysSince(d.lastSyncDateTime) }))
    .filter((d) => d.daysSinceSync >= thresholdDays)
    .sort((a, b) => b.daysSinceSync - a.daysSinceSync);
}

function getOsVersionMix(devices) {
  const map = new Map();
  for (const d of devices) {
    const key = `${d.operatingSystem || "Unknown"} ${d.osVersion || ""}`.trim();
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function filterByName(devices, query) {
  const q = query.trim().toLowerCase();
  return q ? devices.filter((d) => (d.deviceName || "").toLowerCase().includes(q)) : devices;
}

const textCmp = (a, b) => (a || "").localeCompare(b || "", undefined, { sensitivity: "base", numeric: true });
const COMPLIANCE_RANK = { noncompliant: 0, unknown: 1, compliant: 2 };

// Each comparator sorts ascending; "never synced" (Infinity days) counts as the oldest.
const STALE_SORTERS = {
  name: (a, b) => textCmp(a.deviceName, b.deviceName),
  user: (a, b) => textCmp(a.userPrincipalName, b.userPrincipalName),
  os: (a, b) => textCmp(formatOs(a), formatOs(b)),
  compliance: (a, b) =>
    COMPLIANCE_RANK[normalizeCompliance(a.complianceState)] - COMPLIANCE_RANK[normalizeCompliance(b.complianceState)],
  lastSync: (a, b) => (b.daysSinceSync === a.daysSinceSync ? 0 : b.daysSinceSync > a.daysSinceSync ? 1 : -1),
  days: (a, b) => (a.daysSinceSync === b.daysSinceSync ? 0 : a.daysSinceSync > b.daysSinceSync ? 1 : -1),
};

function sortStale(rows, { key, dir }) {
  const cmp = STALE_SORTERS[key] || STALE_SORTERS.days;
  const sign = dir === "asc" ? 1 : -1;
  // Tie-break by device name so the order is stable and predictable.
  return [...rows].sort((a, b) => sign * cmp(a, b) || STALE_SORTERS.name(a, b));
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "style") Object.assign(node.style, v);
    else node[k] = v;
  }
  for (const c of children) node.append(c);
  return node;
}

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

const COMPLIANCE_SEGMENTS = [
  { key: "compliant", label: "Compliant", cls: "c-ok" },
  { key: "noncompliant", label: "Noncompliant", cls: "c-bad" },
  { key: "unknown", label: "Unknown", cls: "c-unknown" },
];

const formatOs = (d) => `${d.operatingSystem || ""} ${d.osVersion || ""}`.trim() || "—";

function formatLastSync(d) {
  const days = daysSince(d.lastSyncDateTime);
  if (!Number.isFinite(days)) return ["Never"];
  const ago = days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`;
  return [new Date(d.lastSyncDateTime).toLocaleDateString(), el("span", { className: "sub", textContent: ago })];
}

function renderCompliance(summary) {
  const total = summary.compliant + summary.noncompliant + summary.unknown;
  $("compliance-total").textContent = `${total} devices`;

  $("compliance-bar").replaceChildren(
    ...COMPLIANCE_SEGMENTS.map((s) =>
      el("span", { className: s.cls, title: `${s.label}: ${summary[s.key]}`, style: { width: `${pct(summary[s.key], total)}%` } })
    )
  );

  $("compliance-stats").replaceChildren(
    ...COMPLIANCE_SEGMENTS.map((s) => {
      const btn = el("button", {
        type: "button",
        className: `stat ${s.cls}`,
        title: `Show ${s.label.toLowerCase()} devices`,
        disabled: summary[s.key] === 0,
        onclick: () => openDeviceList(s.key),
      },
        el("span", { className: "stat-label", textContent: s.label }),
        el("span", { className: "stat-value", textContent: summary[s.key] }),
        el("span", { className: "stat-pct", textContent: `${pct(summary[s.key], total)}% of ${state.search.trim() ? "matches" : "fleet"}` }),
        el("span", { className: "stat-cta", textContent: "View devices →", ariaHidden: "true" })
      );
      btn.setAttribute("aria-label", `${s.label}: ${summary[s.key]} devices. View list.`);
      return btn;
    })
  );
}

/** Open the drill-down dialog listing every device in the given compliance bucket. */
function openDeviceList(bucket) {
  const seg = COMPLIANCE_SEGMENTS.find((s) => s.key === bucket);
  const devices = filterByName(state.devices, state.search)
    .filter((d) => normalizeCompliance(d.complianceState) === bucket)
    .sort((a, b) => (a.deviceName || "").localeCompare(b.deviceName || "", undefined, { sensitivity: "base" }));

  $("device-dialog-title").textContent = `${seg.label} devices`;
  $("device-dialog-count").textContent = `${devices.length} device${devices.length === 1 ? "" : "s"}`;
  $("device-dialog").dataset.bucket = bucket;

  $("device-dialog-body").replaceChildren(
    ...(devices.length
      ? devices.map((d) => {
          const days = daysSince(d.lastSyncDateTime);
          return el("tr", {},
            el("td", { textContent: d.deviceName || "—" }),
            el("td", { textContent: d.userPrincipalName || "—" }),
            el("td", { textContent: formatOs(d) }),
            el("td", {}, el("span", { className: `pill ${bucket}`, textContent: d.complianceState || "unknown" })),
            el("td", { className: `num ${days >= state.staleDays ? (days >= 90 ? "days-bad" : "days-warn") : ""}` }, ...formatLastSync(d))
          );
        })
      : [el("tr", {}, el("td", { colSpan: 5, className: "empty", textContent: "No devices in this category" }))])
  );

  $("device-dialog").showModal();
}

function renderStale(stale) {
  $("stale-count").textContent = `${stale.length} device${stale.length === 1 ? "" : "s"}`;
  const body = $("stale-body");

  if (!stale.length) {
    body.replaceChildren(el("tr", {}, el("td", { colSpan: 6, className: "empty", textContent: state.search.trim()
      ? `No devices matching “${state.search.trim()}” are stale for ${state.staleDays}+ days`
      : `No devices stale for ${state.staleDays}+ days 🎉` })));
    return;
  }

  body.replaceChildren(
    ...stale.map((d) => {
      const compliance = normalizeCompliance(d.complianceState);
      const days = d.daysSinceSync;
      const last = Number.isFinite(days) ? new Date(d.lastSyncDateTime).toLocaleDateString() : "Never";
      return el("tr", {},
        el("td", { textContent: d.deviceName || "—" }),
        el("td", { textContent: d.userPrincipalName || "—" }),
        el("td", { textContent: formatOs(d) }),
        el("td", {}, el("span", { className: `pill ${compliance}`, textContent: compliance })),
        el("td", { className: "num", textContent: last }),
        el("td", { className: `num ${days >= 90 ? "days-bad" : "days-warn"}`, textContent: Number.isFinite(days) ? days : "—" })
      );
    })
  );
}

function renderOsMix(mix) {
  const total = mix.reduce((sum, m) => sum + m.count, 0);
  const max = mix.length ? mix[0].count : 0;
  $("os-total").textContent = `${mix.length} versions`;

  if (!mix.length) {
    $("os-list").replaceChildren(el("li", { className: "empty-state", textContent: state.search.trim() ? "No matching devices" : "No devices" }));
    return;
  }

  $("os-list").replaceChildren(
    ...mix.map((m) =>
      el("li", {},
        el("div", { className: "os-row-top" },
          el("span", { className: "os-name", textContent: m.label }),
          el("span", { className: "os-count", textContent: `${m.count} · ${pct(m.count, total)}%` })
        ),
        el("div", { className: "os-track" },
          el("div", { className: "os-fill", style: { width: `${pct(m.count, max)}%` } })
        )
      )
    )
  );
}

function renderSortHeaders() {
  for (const th of $("stale-head").querySelectorAll("th[data-sort]")) {
    if (th.dataset.sort === state.staleSort.key) th.setAttribute("aria-sort", state.staleSort.dir === "asc" ? "ascending" : "descending");
    else th.removeAttribute("aria-sort");
  }
}

function renderSearchMeta(shown, total) {
  const q = state.search.trim();
  const meta = $("search-meta");
  if (!q || !state.dataReady) { meta.replaceChildren(); return; }
  meta.replaceChildren(`Showing ${shown} of ${total} devices matching `, el("mark", { textContent: `“${q}”` }));
}

/** Re-render all three widgets from already-loaded data (search, threshold, sort). No fetch. */
function renderWidgets() {
  if (!state.dataReady) return;
  const devices = filterByName(state.devices, state.search);
  renderCompliance(getComplianceSummary(devices));
  state.staleRows = sortStale(getStaleDevices(devices, state.staleDays), state.staleSort);
  renderStale(state.staleRows);
  $("stale-export").disabled = !state.staleRows.length;
  renderOsMix(getOsVersionMix(devices));
  renderSortHeaders();
  renderSearchMeta(devices.length, state.devices.length);
}

function renderAuth() {
  const btn = $("auth-button");
  btn.textContent = state.signedIn ? "Sign out" : "Sign in";
  btn.classList.toggle("secondary", state.signedIn);
  const user = $("user-name");
  user.hidden = !state.signedIn;
  user.textContent = state.account?.username || state.account?.name || "";
}

function setStatus(msg) {
  $("status").textContent = msg;
}

function setLoading(isLoading) {
  const grid = $("dashboard");
  grid.classList.toggle("is-loading", isLoading);
  grid.setAttribute("aria-busy", String(isLoading));
  $("retry-button").disabled = isLoading;
}

function showError(message) {
  $("error-text").textContent = message;
  $("error-banner").hidden = false;
}

function hideError() {
  $("error-banner").hidden = true;
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------
// Quote per RFC 4180, and neutralise leading = + - @ (and tab/CR) so a device
// name can't execute as a spreadsheet formula when the file is opened in Excel.
function csvCell(value) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function staleRowsToCsv(rows) {
  const header = ["Device", "User", "OS", "Compliance", "Last sync (UTC)", "Days since sync"];
  const lines = rows.map((d) => {
    const synced = Number.isFinite(d.daysSinceSync);
    return [
      d.deviceName,
      d.userPrincipalName,
      formatOs(d) === "—" ? "" : formatOs(d),
      d.complianceState || "unknown",
      synced ? new Date(d.lastSyncDateTime).toISOString() : "Never",
      synced ? d.daysSinceSync : "",
    ].map(csvCell).join(",");
  });
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}

function exportStaleCsv() {
  const rows = state.staleRows;
  if (!rows.length) return;
  // BOM so Excel opens UTF-8 (accented names) correctly.
  const blob = new Blob(["\uFEFF" + staleRowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const q = state.search.trim().replace(/[^\w-]+/g, "_").slice(0, 30);
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const a = el("a", { href: url, download: `stale-devices-${state.staleDays}d${q ? `-${q}` : ""}-${date}.csv` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  setStatus(`Exported ${rows.length} stale device${rows.length === 1 ? "" : "s"} to CSV.`);
}

/** Replace widget contents with an explicit "unavailable" state so stale data is never mistaken for current. */
function renderUnavailable() {
  const msg = "Data unavailable";
  $("compliance-total").textContent = "";
  $("compliance-bar").replaceChildren();
  $("compliance-stats").replaceChildren(el("p", { className: "empty-state", textContent: msg }));
  $("os-total").textContent = "";
  $("os-list").replaceChildren(el("li", { className: "empty-state", textContent: msg }));
  $("stale-count").textContent = "—";
  state.staleRows = [];
  $("stale-export").disabled = true;
  $("search-meta").replaceChildren();
  $("stale-body").replaceChildren(el("tr", {}, el("td", { colSpan: 6, className: "empty", textContent: msg })));
}

let loadSeq = 0;

async function loadDashboard() {
  const seq = ++loadSeq;
  hideError();
  setLoading(true);
  setStatus(state.signedIn ? "Loading devices from Microsoft Graph…" : "Loading…");
  try {
    const { devices, source } = await getManagedDevices((msg) => seq === loadSeq && setStatus(msg));
    if (seq !== loadSeq) return; // a newer load (e.g. sign-out) superseded this one
    state.devices = devices;
    state.dataReady = true;
    $("data-source").textContent = `${source} · ${devices.length} device${devices.length === 1 ? "" : "s"}`;
    renderWidgets();
    setStatus(`Last refreshed ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    if (seq !== loadSeq) return;
    console.error(err);
    state.devices = [];
    state.dataReady = false;
    $("data-source").textContent = "Load failed";
    renderUnavailable();
    showError(`Couldn't load device data. ${err.message}`);
    setStatus("");
  } finally {
    if (seq === loadSeq) setLoading(false);
  }
}

async function onAuthClick() {
  const btn = $("auth-button");
  btn.disabled = true;
  try {
    if (state.signedIn) {
      await signOut();
      state.signedIn = false;
      state.account = null;
    } else {
      state.account = await signIn();
      state.signedIn = !!state.account;
    }
    renderAuth();
    await loadDashboard();
  } catch (err) {
    console.error(err);
    if (err instanceof BrowserAuthError && err.errorCode === "user_cancelled") {
      setStatus("Sign-in cancelled.");
    } else {
      setStatus(`Authentication error: ${err.message}`);
    }
  } finally {
    btn.disabled = false;
  }
}

async function main() {
  // The popup redirects back to this page; let MSAL in the opener read the response
  // instead of booting a second copy of the dashboard inside the popup.
  if (window.opener && window.opener !== window && window.name.startsWith("msal.")) return;

  const btn = $("auth-button");
  btn.addEventListener("click", onAuthClick);
  $("retry-button").addEventListener("click", () => loadDashboard());
  $("device-dialog-close").addEventListener("click", () => $("device-dialog").close());
  // Click on the backdrop (outside the dialog box) closes it.
  $("device-dialog").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  });
  // Explicit Esc handling; some embedded browsers don't honor the native dialog cancel.
  $("device-dialog").addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); e.currentTarget.close(); }
  });
  // Re-filter the already-loaded devices; no Graph call.
  $("stale-days").addEventListener("change", (e) => {
    state.staleDays = Number(e.target.value) || STALE_DAYS;
    renderWidgets();
  });
  $("device-search").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderWidgets();
  });
  // Esc clears the search; "/" focuses it from anywhere (unless typing in a field).
  $("device-search").addEventListener("keydown", (e) => {
    if (e.key === "Escape" && e.target.value) { e.target.value = ""; state.search = ""; renderWidgets(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName) && !$("device-dialog").open) {
      e.preventDefault();
      $("device-search").focus();
    }
  });
  // Clicking a header sorts by it; clicking the active header flips direction.
  $("stale-head").addEventListener("click", (e) => {
    const key = e.target.closest("th[data-sort]")?.dataset.sort;
    if (!key) return;
    const s = state.staleSort;
    const defaultDir = key === "days" || key === "lastSync" ? "desc" : "asc";
    state.staleSort = s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: defaultDir };
    renderWidgets();
  });
  $("stale-export").addEventListener("click", exportStaleCsv);
  renderSortHeaders();
  $("demo-badge").hidden = !DEMO_MODE;
  btn.disabled = true;
  try {
    await initAuth();
  } catch (err) {
    console.error(err);
    showError(`Sign-in is unavailable. MSAL initialization failed: ${err.message}`);
    return;
  }
  btn.disabled = false;
  renderAuth();
  await loadDashboard();
}

main();
