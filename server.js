const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const reportsPath = path.join(rootDir, "data", "reports.json");
const auditPath = path.join(rootDir, "data", "audit.json");
const port = process.env.PORT || 3000;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function readReports() {
  ensureFile(reportsPath, { nextReportId: 1, reports: [] });
  const raw = fs.readFileSync(reportsPath, "utf8");
  const data = JSON.parse(raw);
  return {
    nextReportId: Number.parseInt(data.nextReportId, 10) || 1,
    reports: Array.isArray(data.reports) ? data.reports : [],
  };
}

function writeReports(payload) {
  const data = {
    nextReportId: Number.parseInt(payload.nextReportId, 10) || 1,
    reports: Array.isArray(payload.reports) ? payload.reports : [],
  };
  fs.writeFileSync(reportsPath, JSON.stringify(data, null, 2));
}

function readAudit() {
  ensureFile(auditPath, { entries: [] });
  const raw = fs.readFileSync(auditPath, "utf8");
  const data = JSON.parse(raw);
  return {
    entries: Array.isArray(data.entries) ? data.entries : [],
  };
}

function writeAudit(payload) {
  const data = {
    entries: Array.isArray(payload.entries) ? payload.entries : [],
  };
  fs.writeFileSync(auditPath, JSON.stringify(data, null, 2));
}

function appendAudit(entry) {
  const audit = readAudit();
  audit.entries.unshift(entry);
  audit.entries = audit.entries.slice(0, 200);
  writeAudit(audit);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/api/reports" && request.method === "GET") {
      const data = readReports();
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === "/api/reports" && request.method === "POST") {
      const body = await readRequestBody(request);
      const payload = JSON.parse(body || "{}");
      writeReports(payload);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/api/audit" && request.method === "GET") {
      const data = readAudit();
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === "/api/audit/append" && request.method === "POST") {
      const body = await readRequestBody(request);
      const payload = JSON.parse(body || "{}");
      appendAudit({
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        userName: payload.userName || "Unknown",
        userUsername: payload.userUsername || "",
        action: payload.action || "Unknown",
        detail: payload.detail || "",
      });
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/api/commands" && request.method === "POST") {
      const body = await readRequestBody(request);
      const payload = JSON.parse(body || "{}");
      if (payload.command === "clearreports") {
        writeReports({ nextReportId: 1, reports: [] });
        appendAudit({
          id: crypto.randomUUID(),
          time: new Date().toISOString(),
          userName: payload.userName || "Unknown",
          userUsername: payload.userUsername || "",
          action: "Clear Reports",
          detail: "All reports cleared",
        });
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: true }));
        return;
      }
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.normalize(path.join(rootDir, pathname));

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403, { "Content-Type": "text/plain" });
      response.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Server error");
  }
});

server.listen(port, () => {
  console.log(`RCPD CAD server running on http://localhost:${port}`);
});
