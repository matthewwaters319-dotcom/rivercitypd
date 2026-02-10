const loginPanel = document.getElementById("login-panel");
const dashboardPanel = document.getElementById("dashboard-panel");
const reportPanel = document.getElementById("report-panel");
const auditPanel = document.getElementById("audit-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const reportButtons = document.getElementById("report-buttons");
const reportTitle = document.getElementById("report-title");
const reportFields = document.getElementById("report-fields");
const reportForm = document.getElementById("report-form");
const reportSuccess = document.getElementById("report-success");
const sessionEl = document.getElementById("session");
const reportTableBody = document.getElementById("report-table-body");
const logoutBtn = document.getElementById("logout-btn");
const auditBtn = document.getElementById("audit-btn");
const auditBackBtn = document.getElementById("audit-back-btn");
const auditTableBody = document.getElementById("audit-table-body");
const backBtn = document.getElementById("back-btn");
const cancelReport = document.getElementById("cancel-report");
const localTimeEl = document.getElementById("local-time");
const reportSearch = document.getElementById("report-search");
const terminalIdEl = document.getElementById("terminal-id");
const reportModal = document.getElementById("report-modal");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const modalApprove = document.getElementById("modal-approve");
const modalExport = document.getElementById("modal-export");
const commandBar = document.getElementById("command-bar");
const commandInput = document.getElementById("command-input");
const commandStatus = document.getElementById("command-status");

const REPORT_API = "/api/reports";
const AUDIT_API = "/api/audit";
const COMMAND_API = "/api/commands";

const REPORTS = [
  "Tresspass Notice",
  "Arrest Report",
  "Written Warning",
  "Vehicle Citation",
  "General Citation",
  "Search Warrant",
  "Arrest Warrant",
  "General Occurrence Report",
];

const REPORT_FIELDS = {
  "Tresspass Notice": [
    { label: "Issued By", name: "issuedBy", type: "text" },
    { label: "Recipient Name", name: "recipient", type: "text" },
    { label: "Location", name: "location", type: "text" },
    { label: "Effective Date", name: "effectiveDate", type: "date" },
    { label: "Expiration Date", name: "expirationDate", type: "date" },
    { label: "Details", name: "details", type: "textarea" },
  ],
  "Arrest Report": [
    { label: "Case Number", name: "caseNumber", type: "text" },
    { label: "Arresting Officer", name: "officer", type: "text" },
    { label: "Subject Name", name: "subject", type: "text" },
    { label: "Charges", name: "charges", type: "text" },
    { label: "Booking Facility", name: "facility", type: "text" },
    { label: "Date/Time", name: "dateTime", type: "datetime-local" },
    { label: "Narrative", name: "narrative", type: "textarea" },
  ],
  "Written Warning": [
    { label: "Officer", name: "officer", type: "text" },
    { label: "Subject", name: "subject", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Date/Time", name: "dateTime", type: "datetime-local" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "Vehicle Citation": [
    { label: "Officer", name: "officer", type: "text" },
    { label: "Driver", name: "driver", type: "text" },
    { label: "Plate", name: "plate", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Court Date", name: "courtDate", type: "date" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "General Citation": [
    { label: "Officer", name: "officer", type: "text" },
    { label: "Recipient", name: "recipient", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Fine Amount", name: "fine", type: "text" },
    { label: "Due Date", name: "dueDate", type: "date" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "Search Warrant": [
    { label: "Judge", name: "judge", type: "text" },
    { label: "Affiant", name: "affiant", type: "text" },
    { label: "Location", name: "location", type: "text" },
    { label: "Date Issued", name: "dateIssued", type: "date" },
    { label: "Scope", name: "scope", type: "textarea" },
  ],
  "Arrest Warrant": [
    { label: "Judge", name: "judge", type: "text" },
    { label: "Subject", name: "subject", type: "text" },
    { label: "Charges", name: "charges", type: "text" },
    { label: "Date Issued", name: "dateIssued", type: "date" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "General Occurrence Report": [
    { label: "Case Number", name: "caseNumber", type: "text" },
    { label: "Reporting Officer", name: "officer", type: "text" },
    { label: "Location", name: "location", type: "text" },
    { label: "Date/Time", name: "dateTime", type: "datetime-local" },
    { label: "Incident Type", name: "incidentType", type: "text" },
    { label: "Narrative", name: "narrative", type: "textarea" },
  ],
};

const state = {
  user: null,
  activeReport: null,
  reports: [],
  nextReportId: 1,
  pendingReportId: "0000001",
  modalReportId: null,
  auditLog: [],
};

function getUserTag() {
  return state.user && state.user.tag ? state.user.tag.toLowerCase() : "";
}

function canViewAllReports() {
  const tag = getUserTag();
  return tag === "admin" || tag === "supervisor";
}

function canApproveReports() {
  const tag = getUserTag();
  return tag === "admin" || tag === "supervisor";
}

function canAccessAuditLog() {
  return getUserTag() === "admin";
}

function setSessionText() {
  if (!state.user) {
    sessionEl.textContent = "Not signed in";
    return;
  }

  sessionEl.textContent = "";
  const label = document.createElement("span");
  label.textContent = `${state.user.name} | ${state.user.role}`;
  sessionEl.appendChild(label);

  if (state.user.tag) {
    const badge = document.createElement("span");
    badge.className = `tag-badge tag-${state.user.tag
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    badge.textContent = state.user.tag;
    sessionEl.appendChild(badge);
  }
}

function setCallsignText() {
  if (!terminalIdEl) {
    return;
  }

  if (!state.user) {
    terminalIdEl.textContent = "UNASSIGNED";
    return;
  }

  terminalIdEl.textContent = state.user.callsign || "UNASSIGNED";
}

function setCommandVisibility() {
  if (!commandBar) {
    return;
  }
  const isAdmin =
    state.user && state.user.tag && state.user.tag.toLowerCase() === "admin";
  commandBar.classList.toggle("hidden", !isAdmin);
  if (auditBtn) {
    auditBtn.classList.toggle("hidden", !isAdmin);
  }
}

function showPanel(panel) {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.add("hidden");
  reportPanel.classList.add("hidden");
  if (auditPanel) {
    auditPanel.classList.add("hidden");
  }
  panel.classList.remove("hidden");
}

async function loadLogins() {
  const response = await fetch("data/logins.json");
  if (!response.ok) {
    throw new Error("Unable to load logins.json");
  }
  return response.json();
}

async function fetchReports() {
  const response = await fetch(REPORT_API, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load reports");
  }
  const data = await response.json();
  state.reports = Array.isArray(data.reports) ? data.reports : [];
  const nextId = Number.parseInt(data.nextReportId, 10);
  state.nextReportId = Number.isNaN(nextId) ? 1 : nextId;
  state.pendingReportId = formatReportId(state.nextReportId);
}

async function persistReports() {
  const payload = {
    reports: state.reports,
    nextReportId: state.nextReportId,
  };
  const response = await fetch(REPORT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to save reports");
  }
}

async function fetchAuditLog() {
  const response = await fetch(AUDIT_API, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load audit log");
  }
  const data = await response.json();
  state.auditLog = Array.isArray(data.entries) ? data.entries : [];
}

async function appendAuditEntry(action, detail) {
  if (!state.user) {
    return;
  }
  await fetch(`${AUDIT_API}/append`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: state.user.name,
      userUsername: state.user.username,
      action,
      detail,
    }),
  });
  await fetchAuditLog();
  renderAuditLog();
}

async function initializeReports() {
  try {
    await fetchReports();
    renderRecentReports();
  } catch (error) {
    reportTableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "Unable to load reports. Start the server.";
    row.appendChild(cell);
    reportTableBody.appendChild(row);
  }
}

function formatReportId(value) {
  return String(value).padStart(7, "0");
}

function reserveNextReportId() {
  state.pendingReportId = formatReportId(state.nextReportId);
}

function buildSummary(data) {
  const entries = Object.entries(data).filter(([key]) => key !== "reportId");
  const firstValue = entries.length ? String(entries[0][1]).trim() : "";
  return firstValue || "Report saved";
}

function truncateSummary(text, maxLength = 28) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

function setCommandStatus(message) {
  if (commandStatus) {
    commandStatus.textContent = message;
  }
}

async function runCommand(rawValue) {
  const command = rawValue.trim().toLowerCase();
  if (!command) {
    return;
  }

  if (command === "clearreports") {
    try {
      const response = await fetch(COMMAND_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          userName: state.user ? state.user.name : "",
          userUsername: state.user ? state.user.username : "",
        }),
      });
      if (!response.ok) {
        throw new Error("Command failed");
      }
      await fetchReports();
      renderRecentReports();
      await fetchAuditLog();
      renderAuditLog();
      setCommandStatus("Reports cleared.");
    } catch (error) {
      setCommandStatus("Command failed.");
    }
    return;
  }

  setCommandStatus("Unknown command.");
}

function renderRecentReports() {
  reportTableBody.innerHTML = "";
  const query = reportSearch ? reportSearch.value.trim().toLowerCase() : "";
  const filtered = state.reports.filter((report) => {
    if (!canViewAllReports()) {
      const username = state.user ? state.user.username : "";
      if (report.createdByUsername !== username) {
        return false;
      }
    }
    if (!query) {
      return true;
    }
    const createdByName = report.createdByName || report.createdBy || "Unknown";
    const haystack = [
      report.reportId,
      report.type,
      report.summary,
      createdByName,
      report.createdAt,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No reports saved yet.";
    row.appendChild(cell);
    reportTableBody.appendChild(row);
    return;
  }

  filtered.slice().reverse().forEach((report) => {
    const row = document.createElement("tr");
    const displayId = report.reportId || report.id || "--------";
    const createdDate = new Date(report.createdAt).toLocaleDateString();

    row.dataset.reportId = displayId;

    const createdByName = report.createdByName || report.createdBy || "Unknown";

    const status = report.status || "Submitted";
    const statusClass = status.toLowerCase() === "approved" ? "approved" : "";

    row.innerHTML = `
      <td>${displayId}</td>
      <td>${report.type}</td>
      <td>${createdDate}</td>
      <td>${createdByName}</td>
      <td>${truncateSummary(report.summary)}</td>
      <td><span class="status-pill ${statusClass}">${status}</span></td>
    `;

    reportTableBody.appendChild(row);
  });
}

function renderAuditLog() {
  if (!auditTableBody) {
    return;
  }
  auditTableBody.innerHTML = "";
  if (!state.auditLog.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No audit entries yet.";
    row.appendChild(cell);
    auditTableBody.appendChild(row);
    return;
  }

  state.auditLog.forEach((entry) => {
    const row = document.createElement("tr");
    const time = new Date(entry.time).toLocaleString();
    row.innerHTML = `
      <td>${time}</td>
      <td>${entry.userName}</td>
      <td>${entry.action}</td>
      <td>${entry.detail}</td>
    `;
    auditTableBody.appendChild(row);
  });
}

function openReportModal(report) {
  if (!reportModal || !modalTitle || !modalBody || !modalMeta) {
    return;
  }

  state.modalReportId = report.reportId;
  if (modalApprove) {
    const alreadyApproved =
      (report.status || "Submitted").toLowerCase() === "approved";
    modalApprove.classList.toggle(
      "hidden",
      !canApproveReports() || alreadyApproved
    );
  }
  if (modalExport) {
    modalExport.classList.remove("hidden");
  }

  modalTitle.textContent = `${report.type} | ${report.reportId}`;
  const createdDate = new Date(report.createdAt).toLocaleString();
  const createdByName = report.createdByName || report.createdBy || "Unknown";
  modalMeta.textContent = `${createdDate} | ${createdByName}`;
  modalBody.innerHTML = "";

  const fields = REPORT_FIELDS[report.type] || [];
  const displayFields = [
    { label: "Report ID", value: report.reportId },
    { label: "Type", value: report.type },
    { label: "Status", value: report.status || "Submitted" },
  ];

  fields.forEach((field) => {
    const value = report.data ? report.data[field.name] : "";
    displayFields.push({ label: field.label, value: value || "--" });
  });

  displayFields.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "modal-field";
    const label = document.createElement("div");
    label.className = "modal-label";
    label.textContent = item.label;
    const value = document.createElement("div");
    value.className = "modal-value";
    value.textContent = item.value;
    wrapper.appendChild(label);
    wrapper.appendChild(value);
    modalBody.appendChild(wrapper);
  });

  reportModal.classList.remove("hidden");
}

function closeReportModal() {
  if (reportModal) {
    reportModal.classList.add("hidden");
  }
  state.modalReportId = null;
}

function getReportById(reportId) {
  return state.reports.find((item) => item.reportId === reportId);
}

function approveReport() {
  if (!canApproveReports()) {
    return;
  }
  if (!state.modalReportId) {
    return;
  }
  const report = getReportById(state.modalReportId);
  if (!report) {
    return;
  }
  report.status = "Approved";
  report.approvedAt = new Date().toISOString();
  report.approvedByName = state.user ? state.user.name : "Unknown";
  report.approvedByUsername = state.user ? state.user.username : "";
  persistReports()
    .then(async () => {
      await appendAuditEntry("Approve Report", `${report.reportId} ${report.type}`);
      renderRecentReports();
      openReportModal(report);
    })
    .catch(() => {
      setCommandStatus("Unable to approve report.");
    });
}

function exportReport() {
  if (!state.modalReportId) {
    return;
  }
  const report = getReportById(state.modalReportId);
  if (!report) {
    return;
  }
  const jspdf = window.jspdf;
  if (!jspdf || !jspdf.jsPDF) {
    return;
  }

  const doc = new jspdf.jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  let y = margin;
  const lineHeight = 16;

  const safeType = report.type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const createdDate = new Date(report.createdAt).toLocaleString();
  const createdByName = report.createdByName || report.createdBy || "Unknown";
  const approvedBy = report.approvedByName || "--";
  const approvedAt = report.approvedAt
    ? new Date(report.approvedAt).toLocaleString()
    : "--";

  doc.setFontSize(16);
  doc.text(`${report.type} | ${report.reportId}`, margin, y);
  y += lineHeight + 4;

  doc.setFontSize(10);
  doc.text(`Created: ${createdDate}`, margin, y);
  y += lineHeight;
  doc.text(`Officer: ${createdByName}`, margin, y);
  y += lineHeight;
  doc.text(`Status: ${report.status || "Submitted"}`, margin, y);
  y += lineHeight;
  doc.text(`Approved By: ${approvedBy}`, margin, y);
  y += lineHeight;
  doc.text(`Approved At: ${approvedAt}`, margin, y);
  y += lineHeight + 6;

  const fields = REPORT_FIELDS[report.type] || [];
  fields.forEach((field) => {
    const value = report.data ? report.data[field.name] : "";
    const displayValue = value ? String(value) : "--";
    doc.setFont(undefined, "bold");
    doc.text(`${field.label}:`, margin, y);
    doc.setFont(undefined, "normal");
    const wrapped = doc.splitTextToSize(displayValue, 520);
    y += lineHeight;
    doc.text(wrapped, margin, y);
    y += wrapped.length * lineHeight + 4;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  });

  doc.save(`${report.reportId}-${safeType}.pdf`);
  appendAuditEntry("Export Report", `${report.reportId} ${report.type}`).catch(
    () => {
      setCommandStatus("Audit log unavailable.");
    }
  );
}

function buildReportButtons() {
  reportButtons.innerHTML = "";
  REPORTS.forEach((reportName) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost";
    button.textContent = reportName;
    button.addEventListener("click", () => openReport(reportName));
    reportButtons.appendChild(button);
  });

  document.querySelectorAll(".cad-actions button").forEach((button) => {
    const reportName = button.dataset.report;
    if (!reportName) {
      return;
    }
    button.addEventListener("click", () => openReport(reportName));
  });
}

function openReport(reportName) {
  state.activeReport = reportName;
  reportTitle.textContent = reportName;
  reportSuccess.textContent = "";
  reportForm.reset();
  reserveNextReportId();
  buildReportFields(reportName);
  showPanel(reportPanel);
}

function buildReportFields(reportName) {
  reportFields.innerHTML = "";
  const fields = REPORT_FIELDS[reportName] || [];

  const idWrapper = document.createElement("label");
  idWrapper.textContent = "Report ID";
  const idInput = document.createElement("input");
  idInput.name = "reportId";
  idInput.type = "text";
  idInput.value = state.pendingReportId;
  idInput.readOnly = true;
  idWrapper.appendChild(idInput);
  reportFields.appendChild(idWrapper);

  fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.textContent = field.label;
    let input;

    if (field.type === "textarea") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = field.type;
    }

    input.name = field.name;
    input.required = true;
    wrapper.appendChild(input);
    reportFields.appendChild(wrapper);
  });
}

function handleLogin(user) {
  state.user = user;
  setSessionText();
  setCallsignText();
  setCommandVisibility();
  appendAuditEntry("Login", `${user.name}`).catch(() => {
    setCommandStatus("Audit log unavailable.");
  });
  renderRecentReports();
  showPanel(dashboardPanel);
}

function updateLocalTime() {
  if (!localTimeEl) {
    return;
  }
  const now = new Date();
  localTimeEl.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const logins = await loadLogins();
    const match = logins.users.find(
      (user) => user.username === username && user.password === password
    );

    if (!match) {
      loginError.textContent = "Invalid credentials.";
      return;
    }

    handleLogin(match);
  } catch (error) {
    loginError.textContent = "Login service unavailable.";
  }
});

logoutBtn.addEventListener("click", () => {
  if (state.user) {
    appendAuditEntry("Logout", `${state.user.name}`).catch(() => {
      setCommandStatus("Audit log unavailable.");
    });
  }
  state.user = null;
  setSessionText();
  setCallsignText();
  setCommandVisibility();
  showPanel(loginPanel);
});

backBtn.addEventListener("click", () => {
  showPanel(dashboardPanel);
});

cancelReport.addEventListener("click", () => {
  showPanel(dashboardPanel);
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(reportForm);
  const data = Object.fromEntries(formData.entries());

  const summary = buildSummary(data);
  const reportId = state.pendingReportId;
  state.reports.push({
    id: reportId,
    reportId,
    type: state.activeReport,
    summary,
    data,
    status: "Submitted",
    createdAt: new Date().toISOString(),
    createdByName: state.user ? state.user.name : "Unknown",
    createdByUsername: state.user ? state.user.username : "",
  });

  state.nextReportId += 1;
  try {
    await persistReports();
    await appendAuditEntry("Create Report", `${reportId} ${state.activeReport}`);
    renderRecentReports();
    reportSuccess.textContent = "Report saved locally.";
    reportForm.reset();
  } catch (error) {
    reportSuccess.textContent = "Unable to save report. Start the server.";
  }
});

setSessionText();
setCallsignText();
setCommandVisibility();
buildReportButtons();
updateLocalTime();
setInterval(updateLocalTime, 1000);
initializeReports();
fetchAuditLog().then(renderAuditLog).catch(() => {
  if (auditTableBody) {
    auditTableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "Unable to load audit log. Start the server.";
    row.appendChild(cell);
    auditTableBody.appendChild(row);
  }
});

if (reportSearch) {
  reportSearch.addEventListener("input", renderRecentReports);
}

if (reportTableBody) {
  reportTableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (!row || !row.dataset.reportId) {
      return;
    }
    const report = state.reports.find(
      (item) => item.reportId === row.dataset.reportId
    );
    if (report) {
      openReportModal(report);
    }
  });
}

if (auditBtn) {
  auditBtn.addEventListener("click", async () => {
    if (!canAccessAuditLog()) {
      return;
    }
    try {
      await fetchAuditLog();
      renderAuditLog();
    } catch (error) {
      renderAuditLog();
    }
    showPanel(auditPanel);
  });
}

if (auditBackBtn) {
  auditBackBtn.addEventListener("click", () => {
    showPanel(dashboardPanel);
  });
}

if (modalClose) {
  modalClose.addEventListener("click", closeReportModal);
}

if (modalApprove) {
  modalApprove.addEventListener("click", approveReport);
}

if (modalExport) {
  modalExport.addEventListener("click", exportReport);
}

if (reportModal) {
  reportModal.addEventListener("click", (event) => {
    if (event.target === reportModal) {
      closeReportModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeReportModal();
  }
});

if (commandInput) {
  commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void runCommand(commandInput.value);
      commandInput.value = "";
    }
  });
}
