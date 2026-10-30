"use strict";

// Demo mode also works at http://localhost:3000/?demo=1 without MSAL or tenant access.
const DEMO_MODE = new URLSearchParams(location.search).get("demo") === "1";
// Register this URI under the Entra app's Single-page application platform.
// Grant admin consent for the delegated Graph permission below; no client secret is used.
// Serve this directory locally: python -m http.server 57627 --bind localhost
const REDIRECT_URI = "http://localhost:57627/";
const AUTH_SCOPES = ["DeviceManagementManagedDevices.Read.All"];
let msalApp;
let InteractionRequiredAuthError;
let account = null;
let authReady = false;
let deviceLoadController = null;
let loadedDevices = [];
let hasLoadedDevices = false;
let staleSort = { key: "lastSync", direction: "ascending" };
const GRAPH_DEVICES_URL = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices";
// Retry throttled pages five times, then expose a recoverable error instead of waiting forever.
const MAX_THROTTLE_RETRIES = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_DAYS = 30;
const COMPLIANCE = [
  { key: "compliant", label: "Compliant", color: "green-bg" },
  { key: "noncompliant", label: "Noncompliant", color: "amber-bg" },
  { key: "unknown", label: "Unknown", color: "purple-bg" },
];

const sampleDevices = [
  ["SEA-LT-001", "compliant", 1, "10.0.26100"],
  ["SEA-LT-002", "compliant", 2, "10.0.26100"],
  ["SEA-LT-003", "compliant", 0, "10.0.26100"],
  ["SEA-LT-004", "noncompliant", 4, "10.0.26100"],
  ["NYC-LT-005", "compliant", 1, "10.0.26100"],
  ["NYC-LT-006", "compliant", 3, "10.0.26100"],
  ["NYC-LT-007", "compliant", 5, "10.0.26100"],
  ["LON-LT-008", "compliant", 2, "10.0.26100"],
  ["LON-LT-009", "compliant", 6, "10.0.22631"],
  ["LON-LT-010", "compliant", 1, "10.0.22631"],
  ["SEA-DT-011", "compliant", 8, "10.0.22631"],
  ["SEA-DT-012", "noncompliant", 12, "10.0.22631"],
  ["NYC-DT-013", "compliant", 3, "10.0.22631"],
  ["NYC-DT-014", "compliant", 7, "10.0.22631"],
  ["LON-DT-015", "compliant", 11, "10.0.19045"],
  ["SEA-LT-016", "compliant", 2, "10.0.19045"],
  ["SEA-MB-017", "compliant", 1, "15.3.1"],
  ["NYC-MB-018", "compliant", 4, "15.3.1"],
  ["LON-LT-019", "noncompliant", 34, "10.0.22631"],
  ["SEA-DT-020", "noncompliant", 47, "10.0.19045"],
  ["NYC-LT-021", "unknown", 62, "10.0.19045"],
  ["LON-MB-022", "unknown", 79, "15.3.1"],
  ["SEA-LT-023", "noncompliant", 103, "10.0.19045"],
  ["NYC-DT-024", "unknown", 121, "10.0.22631"],
].map(([deviceName, complianceState, daysInactive, osVersion], index) => ({
  deviceName,
  complianceState,
  lastSyncDateTime: new Date(Date.now() - daysInactive * DAY_MS).toISOString(),
  osVersion,
  operatingSystem: deviceName.includes("-MB-") ? "macOS" : "Windows",
  userPrincipalName: `demo.user${index + 1}@example.invalid`,
}));

function retryDelay(header, retry) {
  if (header !== null && header.trim() !== "") {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(header);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  }
  return 1000 * (2 ** retry);
}

async function waitForRetry(delay, signal) {
  const deadline = Date.now() + delay;
  // Chunk long waits to avoid the browser's signed 32-bit timer limit.
  do {
    signal.throwIfAborted();
    await new Promise((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, Math.min(Math.max(0, deadline - Date.now()), 2147483647));
      signal.addEventListener("abort", onAbort, { once: true });
    });
  } while (Date.now() < deadline);
}

async function fetchDevicePage(url, signal) {
  if (DEMO_MODE) throw new Error("Microsoft Graph requests are disabled in demo mode.");
  for (let retry = 0; ; retry += 1) {
    const token = await getAccessToken();
    signal.throwIfAborted();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal,
      redirect: "error",
    });
    if (response.status === 429) {
      if (retry >= MAX_THROTTLE_RETRIES) {
        throw new Error("Microsoft Graph is still throttling requests (HTTP 429) after five retries. Try again later.");
      }
      const delay = retryDelay(response.headers.get("Retry-After"), retry);
      showStatus(`Microsoft Graph is throttling requests. Retrying in ${Math.ceil(delay / 1000)} seconds (${retry + 1}/${MAX_THROTTLE_RETRIES})...`);
      await waitForRetry(delay, signal);
      continue;
    }
    if (!response.ok) {
      const guidance = response.status === 401 ? "Sign out and sign in again."
        : response.status === 403 ? "Check admin consent for DeviceManagementManagedDevices.Read.All and your Intune access."
          : "Try loading the devices again.";
      throw new Error(`Microsoft Graph request failed (HTTP ${response.status}). ${guidance}`);
    }
    return response.json();
  }
}

async function getManagedDevices(signal) {
  if (DEMO_MODE) return sampleDevices.map((device) => ({ ...device }));
  const initialUrl = new URL(GRAPH_DEVICES_URL);
  initialUrl.searchParams.set("$select", "deviceName,complianceState,lastSyncDateTime,osVersion,operatingSystem,userPrincipalName");
  initialUrl.searchParams.set("$top", "100");
  let nextLink = initialUrl.href;
  const visited = new Set();
  const devices = [];
  while (nextLink) {
    // Never send the bearer token to a nextLink outside this Graph collection.
    const url = new URL(nextLink);
    if (url.origin !== "https://graph.microsoft.com" || url.pathname !== "/v1.0/deviceManagement/managedDevices"
      || url.username || url.password || url.hash || visited.has(url.href)) {
      throw new Error("Microsoft Graph returned an invalid or repeated pagination link.");
    }
    visited.add(url.href);
    showStatus(`Loading devices from Microsoft Graph... ${devices.length.toLocaleString()} received.`);
    const page = await fetchDevicePage(url.href, signal);
    signal.throwIfAborted();
    const fields = ["deviceName", "complianceState", "lastSyncDateTime", "osVersion", "operatingSystem", "userPrincipalName"];
    if (!page || !Array.isArray(page.value) || page.value.some((device) =>
      !device || typeof device !== "object" || fields.some((field) =>
        device[field] != null && typeof device[field] !== "string"))) {
      throw new Error("Microsoft Graph returned an unexpected device response.");
    }
    for (const device of page.value) devices.push(device);
    nextLink = page["@odata.nextLink"];
    if (nextLink != null && (typeof nextLink !== "string" || !nextLink.trim())) {
      throw new Error("Microsoft Graph returned an invalid pagination link.");
    }
  }
  return devices;
}

async function signIn() {
  const result = await msalApp.loginPopup({ scopes: [...AUTH_SCOPES] });
  if (!result.account) throw new Error("Microsoft Entra did not return an account.");
  msalApp.setActiveAccount(result.account);
  account = result.account;
}

async function signOut() {
  clearDeviceData("Signing out. Device data has been cleared.");
  await msalApp.logoutPopup({ account, postLogoutRedirectUri: REDIRECT_URI });
  msalApp.setActiveAccount(null);
  account = null;
}

// Never persist or log the returned token.
export async function getAccessToken() {
  if (DEMO_MODE) throw new Error("Token acquisition is disabled in demo mode.");
  if (!authReady) throw new Error("Authentication is not initialized. Reload the page.");
  const activeAccount = msalApp.getActiveAccount();
  if (!activeAccount) throw new Error("Sign in before requesting Microsoft Graph access.");
  const request = { account: activeAccount, scopes: [...AUTH_SCOPES] };
  let result;
  try {
    result = await msalApp.acquireTokenSilent(request);
  } catch (error) {
    if (!(error instanceof InteractionRequiredAuthError)) throw error;
    result = await msalApp.acquireTokenPopup(request);
  }
  if (!result.accessToken) throw new Error("Microsoft Entra did not return an access token.");
  return result.accessToken;
}

function showAuthStatus(message, isError = false) {
  const status = document.getElementById("auth-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.setAttribute("role", isError ? "alert" : "status");
}

function updateAuthUI() {
  if (DEMO_MODE) {
    document.getElementById("auth-button").hidden = true;
    setText("session-label", "Demo workspace");
    document.getElementById("load-button").disabled = deviceLoadController !== null;
    return;
  }
  document.getElementById("auth-button").textContent = account ? "Sign out" : "Sign in";
  setText("session-label", account ? (account.name || account.username || "Signed in") : "Not signed in");
  document.getElementById("load-button").disabled = !authReady || !account || deviceLoadController !== null;
}

function reportAuthError(context, error) {
  // Error codes are actionable without exposing tokens or account details in logs.
  const code = error?.errorCode;
  console.error(context, code || "authentication_error");
  const detail = code === "user_cancelled"
    ? "The popup was cancelled."
    : code === "popup_window_error"
      ? "Allow popups for this site, then try again."
      : `Check the app registration, admin consent, and network connection.${code ? ` Error: ${code}.` : ""}`;
  showAuthStatus(`${context} ${detail}`, true);
}

async function initializeAuthentication() {
  try {
    if (location.origin !== new URL(REDIRECT_URI).origin) {
      throw new Error(`Open ${REDIRECT_URI} instead of this URL to use sign-in.`);
    }
    // Dynamic import lets CDN failures surface in the UI.
    const msal = await import("https://cdn.jsdelivr.net/npm/@azure/msal-browser@4/+esm");
    InteractionRequiredAuthError = msal.InteractionRequiredAuthError;
    msalApp = new msal.PublicClientApplication({
      auth: {
        clientId: "60661436-b55b-4c1e-ae87-d0501dfa25e4",
        authority: "https://login.microsoftonline.com/8f0a670f-cf43-4ab7-a2eb-8b57d6f59bc1",
        redirectUri: REDIRECT_URI,
      },
      cache: { cacheLocation: "sessionStorage" },
    });
    await msalApp.initialize();
    authReady = true;
    account = msalApp.getActiveAccount();
    if (!account) {
      const accounts = msalApp.getAllAccounts();
      if (accounts.length === 1) {
        account = accounts[0];
        msalApp.setActiveAccount(account);
      }
    }
    updateAuthUI();
    showAuthStatus(account
      ? "Signed-in session restored."
      : "Sign in with Microsoft Entra ID to load managed devices.");
    document.getElementById("auth-button").disabled = false;
    if (account) await loadDashboard();
  } catch (error) {
    if (location.origin !== new URL(REDIRECT_URI).origin) {
      console.error("Authentication requires the configured localhost origin.");
      showAuthStatus(`Sign-in unavailable here. Serve this folder at ${REDIRECT_URI} and open that URL.`, true);
    } else {
      reportAuthError("Unable to initialize Microsoft Entra sign-in. Reload to retry.", error);
    }
  }
}

function complianceKey(device) {
  return device.complianceState === "compliant" || device.complianceState === "noncompliant"
    ? device.complianceState
    : "unknown";
}

function syncTimestamp(device) {
  if (!device.lastSyncDateTime) return null;
  const timestamp = Date.parse(device.lastSyncDateTime);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getFleetCompliance(devices) {
  const counts = { compliant: 0, noncompliant: 0, unknown: 0 };
  for (const device of devices) counts[complianceKey(device)] += 1;
  return counts;
}

function getStaleDevices(devices, now = Date.now()) {
  const cutoff = now - STALE_DAYS * DAY_MS;
  return devices
    .filter((device) => {
      const timestamp = syncTimestamp(device);
      return timestamp !== null && timestamp <= cutoff;
    })
    .sort((a, b) => syncTimestamp(a) - syncTimestamp(b));
}

function getOSVersionMix(devices) {
  const counts = new Map();
  for (const device of devices) {
    const version = device.osVersion?.trim() || "Unknown version";
    counts.set(version, (counts.get(version) || 0) + 1);
  }
  return [...counts].map(([version, count]) => ({ version, count }))
    .sort((a, b) => b.count - a.count || a.version.localeCompare(b.version));
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function percentage(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

function renderCompliance(counts, total) {
  const bar = document.getElementById("compliance-bar");
  const breakdown = document.getElementById("compliance-breakdown");
  bar.replaceChildren();
  breakdown.replaceChildren();
  for (const category of COMPLIANCE) {
    const count = counts[category.key];
    if (count) {
      const segment = element("div", `compliance-segment ${category.color}`);
      segment.style.flexGrow = String(count);
      bar.append(segment);
    }
    const item = element("button", "compliance-category");
    item.type = "button";
    item.disabled = count === 0;
    item.setAttribute("aria-haspopup", "dialog");
    item.setAttribute("aria-controls", "compliance-dialog");
    item.setAttribute("aria-label", `${category.label}: ${count.toLocaleString()} ${count === 1 ? "device" : "devices"}`);
    item.addEventListener("click", () => openComplianceDialog(category));
    const label = element("span", "category-name");
    const dot = element("span", `dot ${category.color}`);
    dot.setAttribute("aria-hidden", "true");
    label.append(dot, document.createTextNode(category.label));
    item.append(label, element("span", "category-count", count.toLocaleString()),
      element("span", "category-percent", `${percentage(count, total)}%`));
    breakdown.append(item);
  }
}

function lastSyncTime(device, includeTime = false) {
  const timestamp = syncTimestamp(device);
  if (timestamp === null) return document.createTextNode("Unknown");
  const options = { year: "numeric", month: "short", day: "numeric" };
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.timeZoneName = "short";
  }
  const time = element("time", "", new Intl.DateTimeFormat(undefined, options).format(timestamp));
  time.dateTime = new Date(timestamp).toISOString();
  return time;
}

function openComplianceDialog(category) {
  const devices = filteredDevices()
    .filter((device) => complianceKey(device) === category.key)
    .sort((a, b) => (a.deviceName || "").localeCompare(b.deviceName || ""));
  setText("compliance-dialog-title", `${category.label} devices`);
  setText("compliance-dialog-count", `${devices.length.toLocaleString()} ${devices.length === 1 ? "device" : "devices"}`);
  const rows = document.getElementById("compliance-dialog-rows");
  rows.replaceChildren();
  for (const device of devices) {
    const row = element("tr");
    const sync = element("td");
    sync.append(lastSyncTime(device, true));
    row.append(
      element("td", "device-name", device.deviceName || "Unnamed device"),
      element("td", "", device.userPrincipalName || "Not assigned"),
      element("td", "", `${device.operatingSystem || "Unknown OS"} / ${device.osVersion || "Unknown version"}`),
      element("td", "", device.complianceState || "Unknown"),
      sync,
    );
    rows.append(row);
  }
  document.getElementById("compliance-dialog").showModal();
}

const complianceDialog = document.getElementById("compliance-dialog");
document.getElementById("compliance-dialog-close").addEventListener("click", () => complianceDialog.close());
complianceDialog.addEventListener("close", () => {
  document.getElementById("compliance-dialog-rows").replaceChildren();
});
complianceDialog.addEventListener("click", (event) => {
  if (event.target !== complianceDialog) return;
  const bounds = complianceDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    complianceDialog.close();
  }
});

function renderOSMix(mix, total) {
  const container = document.getElementById("os-breakdown");
  container.replaceChildren();
  setText("version-count", `${mix.length} ${mix.length === 1 ? "version" : "versions"}`);
  if (!mix.length) {
    container.append(element("p", "empty-state", "No OS version data to display."));
    return;
  }
  for (const { version, count } of mix) {
    const row = element("div", "os-row");
    const heading = element("div", "os-row-heading");
    heading.append(element("strong", "", version),
      element("span", "", `${count} ${count === 1 ? "device" : "devices"} / ${percentage(count, total)}%`));
    const track = element("div", "os-track");
    track.setAttribute("aria-hidden", "true");
    const fill = element("div", "os-fill");
    fill.style.width = `${(count / total) * 100}%`;
    track.append(fill);
    row.append(heading, track);
    container.append(row);
  }
}

function renderStaleDevices(devices, now) {
  devices = [...devices].sort((a, b) => {
    let comparison;
    if (staleSort.key === "lastSync" || staleSort.key === "daysInactive") {
      comparison = syncTimestamp(a) - syncTimestamp(b);
      if (staleSort.key === "daysInactive") comparison = -comparison;
    } else {
      const value = (device) => staleSort.key === "compliance"
        ? COMPLIANCE.find((category) => category.key === complianceKey(device)).label
        : staleSort.key === "deviceName" ? device.deviceName || "Unnamed device"
          : device.osVersion || "Unknown version";
      comparison = value(a).localeCompare(value(b), undefined, { numeric: true, sensitivity: "base" });
    }
    return (staleSort.direction === "ascending" ? comparison : -comparison)
      || (a.deviceName || "").localeCompare(b.deviceName || "");
  });
  const rows = document.getElementById("stale-rows");
  rows.replaceChildren();
  document.getElementById("stale-empty").hidden = devices.length > 0;
  setText("stale-empty", searchQuery()
    ? "No stale devices match this device-name search."
    : "No stale devices. Every device with a known sync date checked in within 30 days.");
  setText("stale-table-count", devices.length.toLocaleString());
  for (const device of devices) {
    const row = element("tr");
    const name = element("td", "device-name");
    const mark = element("span", "device-mark", "\u25a3");
    mark.setAttribute("aria-hidden", "true");
    name.append(mark, document.createTextNode(device.deviceName || "Unnamed device"));
    const state = complianceKey(device);
    const complianceCell = element("td");
    complianceCell.append(element("span", `compliance-pill ${state}`, COMPLIANCE.find((item) => item.key === state).label));
    const timestamp = syncTimestamp(device);
    const syncCell = element("td");
    syncCell.append(lastSyncTime(device));
    row.append(name, element("td", "", device.osVersion || "Unknown version"), complianceCell,
      syncCell, element("td", "align-right inactive-days", `${Math.floor((now - timestamp) / DAY_MS)} days`));
    rows.append(row);
  }
}

function renderDashboard(devices) {
  loadedDevices = devices;
  hasLoadedDevices = true;
  document.getElementById("device-search").disabled = false;
  renderFilteredDashboard();
  setText("updated-at", `Updated ${new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(Date.now())}`);
}

function searchQuery() {
  return document.getElementById("device-search").value.trim().toLocaleLowerCase();
}

function filteredDevices() {
  const query = searchQuery();
  return loadedDevices.filter((device) => (device.deviceName || "").toLocaleLowerCase().includes(query));
}

function renderFilteredDashboard() {
  const devices = filteredDevices();
  const now = Date.now();
  const counts = getFleetCompliance(devices);
  const stale = getStaleDevices(devices, now);
  const rate = `${percentage(counts.compliant, devices.length)}%`;
  setText("total-count", devices.length.toLocaleString());
  setText("compliance-rate", rate);
  setText("compliant-percent", rate);
  setText("attention-count", (counts.noncompliant + counts.unknown).toLocaleString());
  setText("stale-count", stale.length.toLocaleString());
  renderCompliance(counts, devices.length);
  renderOSMix(getOSVersionMix(devices), devices.length);
  renderStaleDevices(stale, now);
  const unknownSyncCount = devices.filter((device) => syncTimestamp(device) === null).length;
  setText("sync-note", unknownSyncCount
    ? `${unknownSyncCount} device(s) have missing or invalid sync dates and are excluded from the stale table.`
    : "Based on elapsed time since last sync. Use the column headers to change the sort order.");
  setText("compliance-scope", searchQuery() ? "Matching endpoints" : "All endpoints");
  setText("filter-summary", devices.length === 0 && searchQuery()
    ? `No devices match your search (${loadedDevices.length.toLocaleString()} loaded).`
    : `Showing ${devices.length.toLocaleString()} of ${loadedDevices.length.toLocaleString()} loaded devices.`);
}

document.getElementById("device-search").addEventListener("input", () => {
  if (!hasLoadedDevices) return;
  if (complianceDialog.open) complianceDialog.close();
  renderFilteredDashboard();
});

for (const button of document.querySelectorAll("[data-sort]")) {
  button.addEventListener("click", () => {
    const key = button.dataset.sort;
    staleSort = {
      key,
      direction: staleSort.key === key && staleSort.direction === "ascending" ? "descending" : "ascending",
    };
    for (const headerButton of document.querySelectorAll("[data-sort]")) {
      const active = headerButton.dataset.sort === key;
      headerButton.closest("th").setAttribute("aria-sort", active ? staleSort.direction : "none");
      headerButton.querySelector("span").textContent = active
        ? staleSort.direction === "ascending" ? "\u25b2" : "\u25bc" : "";
    }
    if (hasLoadedDevices) renderStaleDevices(getStaleDevices(filteredDevices()), Date.now());
  });
}

function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.setAttribute("role", isError ? "alert" : "status");
}

document.getElementById("auth-button").addEventListener("click", async () => {
  if (DEMO_MODE) return;
  const button = document.getElementById("auth-button");
  button.disabled = true;
  const signingOut = Boolean(account);
  try {
    showAuthStatus(signingOut ? "Signing out..." : "Signing in...");
    if (signingOut) await signOut();
    else await signIn();
    showAuthStatus(account
      ? "Signed in with Microsoft Entra ID."
      : "Signed out.");
    if (account) {
      void loadDashboard();
    }
    else clearDeviceData("Sign in to load managed devices.");
  } catch (error) {
    reportAuthError(signingOut ? "Sign-out did not complete." : "Sign-in or token acquisition did not complete.", error);
  } finally {
    if (authReady) account = msalApp.getActiveAccount();
    updateAuthUI();
    button.disabled = !authReady;
  }
});

function clearDeviceData(message) {
  deviceLoadController?.abort();
  deviceLoadController = null;
  loadedDevices = [];
  hasLoadedDevices = false;
  document.getElementById("device-search").disabled = true;
  setText("filter-summary", "Load devices to search.");
  setText("compliance-scope", "All endpoints");
  if (complianceDialog.open) complianceDialog.close();
  document.getElementById("compliance-dialog-rows").replaceChildren();
  setText("compliance-dialog-title", "Compliance devices");
  setText("compliance-dialog-count", "");
  for (const id of ["total-count", "compliance-rate", "compliant-percent", "attention-count",
    "stale-count", "stale-table-count", "version-count"]) setText(id, "--");
  for (const id of ["compliance-bar", "compliance-breakdown", "os-breakdown", "stale-rows"]) {
    document.getElementById(id).replaceChildren();
  }
  document.getElementById("stale-empty").hidden = true;
  setText("sync-note", "");
  setText("updated-at", "Not loaded");
  document.querySelector("main").setAttribute("aria-busy", "false");
  showStatus(message);
}

async function loadDashboard() {
  clearDeviceData(DEMO_MODE ? "Loading demo device fleet..." : "Loading managed devices from Microsoft Graph...");
  const controller = new AbortController();
  deviceLoadController = controller;
  const main = document.querySelector("main");
  main.setAttribute("aria-busy", "true");
  updateAuthUI();
  try {
    const devices = await getManagedDevices(controller.signal);
    controller.signal.throwIfAborted();
    renderDashboard(devices);
    showStatus(DEMO_MODE
      ? `Loaded ${devices.length.toLocaleString()} sample devices. Demo mode makes no Microsoft Graph calls.`
      : devices.length
      ? `Loaded ${devices.length.toLocaleString()} managed devices from Microsoft Graph. All pages received.`
      : "Microsoft Graph returned no managed devices.");
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error("Dashboard loading failed.", error?.errorCode || error?.name || "request_error");
    setText("updated-at", "Load failed");
    const detail = error instanceof TypeError
      ? "The request could not be completed. Check your network connection and browser access to Microsoft Graph."
      : error instanceof Error ? error.message : "Unexpected request failure.";
    showStatus(`Unable to load endpoint data. ${detail} Use Load devices to retry.`, true);
  } finally {
    if (deviceLoadController === controller) {
      deviceLoadController = null;
      main.setAttribute("aria-busy", "false");
      updateAuthUI();
    }
  }
}

document.getElementById("load-button").addEventListener("click", loadDashboard);
if (DEMO_MODE) {
  setText("data-source-label", "Demo");
  setText("workspace-label", "Sample endpoints");
  setText("data-source-note", "Demo mode / Built-in sample fleet / No Microsoft Graph calls");
  document.querySelector(".brand").href = "./?demo=1";
  showAuthStatus("Demo mode is independent of sign-in. Any existing signed-in session is left unchanged.");
  void loadDashboard();
} else {
  clearDeviceData("Sign in to load managed devices.");
  initializeAuthentication();
}
