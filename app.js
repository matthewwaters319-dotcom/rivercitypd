const loginPanel = document.getElementById("login-panel");
const dashboardPanel = document.getElementById("dashboard-panel");
const reportPanel = document.getElementById("report-panel");
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
const backBtn = document.getElementById("back-btn");
const cancelReport = document.getElementById("cancel-report");
const localTimeEl = document.getElementById("local-time");
const reportSearch = document.getElementById("report-search");

const shiftStatus = {
  callTaker: document.getElementById("shift-calltaker"),
  dispatcher: document.getElementById("shift-dispatcher"),
  unit: document.getElementById("shift-unit"),
};

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
    { label: "Notice ID", name: "noticeId", type: "text" },
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
    { label: "Warning ID", name: "warningId", type: "text" },
    { label: "Officer", name: "officer", type: "text" },
    { label: "Subject", name: "subject", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Date/Time", name: "dateTime", type: "datetime-local" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "Vehicle Citation": [
    { label: "Citation Number", name: "citationNumber", type: "text" },
    { label: "Officer", name: "officer", type: "text" },
    { label: "Driver", name: "driver", type: "text" },
    { label: "Plate", name: "plate", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Court Date", name: "courtDate", type: "date" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "General Citation": [
    { label: "Citation Number", name: "citationNumber", type: "text" },
    { label: "Officer", name: "officer", type: "text" },
    { label: "Recipient", name: "recipient", type: "text" },
    { label: "Violation", name: "violation", type: "text" },
    { label: "Fine Amount", name: "fine", type: "text" },
    { label: "Due Date", name: "dueDate", type: "date" },
    { label: "Notes", name: "notes", type: "textarea" },
  ],
  "Search Warrant": [
    { label: "Warrant ID", name: "warrantId", type: "text" },
    { label: "Judge", name: "judge", type: "text" },
    { label: "Affiant", name: "affiant", type: "text" },
    { label: "Location", name: "location", type: "text" },
    { label: "Date Issued", name: "dateIssued", type: "date" },
    { label: "Scope", name: "scope", type: "textarea" },
  ],
  "Arrest Warrant": [
    { label: "Warrant ID", name: "warrantId", type: "text" },
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

const REPORT_ID_KEY = "rcpdNextReportId";

const state = {
  user: null,
  activeReport: null,
  reports: [],
  nextReportId: 1,
  pendingReportId: "0000001",
};

function setSessionText() {
  if (!state.user) {
    sessionEl.textContent = "Not signed in";
    return;
  }

  sessionEl.textContent = `${state.user.name} | ${state.user.role}`;
}

function showPanel(panel) {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.add("hidden");
  reportPanel.classList.add("hidden");
  panel.classList.remove("hidden");
}

async function loadLogins() {
  const response = await fetch("data/logins.json");
  if (!response.ok) {
    throw new Error("Unable to load logins.json");
  }
  return response.json();
}

function loadSavedReports() {
  const saved = localStorage.getItem("rcpdReports");
  if (saved) {
    state.reports = JSON.parse(saved);
  }
}

function loadReportSequence() {
  const stored = localStorage.getItem(REPORT_ID_KEY);
  const parsed = Number.parseInt(stored, 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    state.nextReportId = parsed;
  }
  state.pendingReportId = formatReportId(state.nextReportId);
}

function saveReportSequence() {
  localStorage.setItem(REPORT_ID_KEY, String(state.nextReportId));
}

function formatReportId(value) {
  return String(value).padStart(7, "0");
}

function reserveNextReportId() {
  state.pendingReportId = formatReportId(state.nextReportId);
}

function saveReports() {
  localStorage.setItem("rcpdReports", JSON.stringify(state.reports));
}

function renderRecentReports() {
  reportTableBody.innerHTML = "";
  const query = reportSearch ? reportSearch.value.trim().toLowerCase() : "";
  const filtered = state.reports.filter((report) => {
    if (!query) {
      return true;
    }
    const haystack = [
      report.reportId,
      report.type,
      report.summary,
      report.createdBy,
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

    row.innerHTML = `
      <td>${displayId}</td>
      <td>${report.type}</td>
      <td>${createdDate}</td>
      <td>${report.createdBy}</td>
      <td>${report.summary}</td>
      <td><span class="status-pill">Submitted</span></td>
    `;

    reportTableBody.appendChild(row);
  });
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

  document.querySelectorAll(".actions button").forEach((button) => {
    button.addEventListener("click", () => openReport(button.dataset.report));
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
  state.user = null;
  setSessionText();
  showPanel(loginPanel);
});

backBtn.addEventListener("click", () => {
  showPanel(dashboardPanel);
});

cancelReport.addEventListener("click", () => {
  showPanel(dashboardPanel);
});

reportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(reportForm);
  const data = Object.fromEntries(formData.entries());

  const summary = Object.values(data)[0] || "Report saved";
  const reportId = state.pendingReportId;
  state.reports.push({
    id: reportId,
    reportId,
    type: state.activeReport,
    summary,
    data,
    createdAt: new Date().toISOString(),
    createdBy: state.user ? state.user.name : "Unknown",
  });

  state.nextReportId += 1;
  saveReportSequence();

  saveReports();
  renderRecentReports();
  reportSuccess.textContent = "Report saved locally.";
  reportForm.reset();
});

loadSavedReports();
loadReportSequence();
setSessionText();
buildReportButtons();
updateLocalTime();
setInterval(updateLocalTime, 1000);

if (reportSearch) {
  reportSearch.addEventListener("input", renderRecentReports);
}
