export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/reports" && request.method === "GET") {
      const data = (await env.REPORTS.get("reports", { type: "json" })) || {
        nextReportId: 1,
        reports: [],
      };
      return jsonResponse(data);
    }

    if (url.pathname === "/api/reports" && request.method === "POST") {
      const payload = await request.json();
      const data = {
        nextReportId: Number.parseInt(payload.nextReportId, 10) || 1,
        reports: Array.isArray(payload.reports) ? payload.reports : [],
      };
      await env.REPORTS.put("reports", JSON.stringify(data));
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/audit" && request.method === "GET") {
      const data = (await env.AUDIT.get("audit", { type: "json" })) || {
        entries: [],
      };
      return jsonResponse(data);
    }

    if (url.pathname === "/api/audit/append" && request.method === "POST") {
      const payload = await request.json();
      const audit = (await env.AUDIT.get("audit", { type: "json" })) || {
        entries: [],
      };
      audit.entries.unshift({
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        userName: payload.userName || "Unknown",
        userUsername: payload.userUsername || "",
        action: payload.action || "Unknown",
        detail: payload.detail || "",
      });
      audit.entries = audit.entries.slice(0, 200);
      await env.AUDIT.put("audit", JSON.stringify(audit));
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/commands" && request.method === "POST") {
      const payload = await request.json();
      if (payload.command === "clearreports") {
        const data = { nextReportId: 1, reports: [] };
        await env.REPORTS.put("reports", JSON.stringify(data));

        const audit = (await env.AUDIT.get("audit", { type: "json" })) || {
          entries: [],
        };
        audit.entries.unshift({
          id: crypto.randomUUID(),
          time: new Date().toISOString(),
          userName: payload.userName || "Unknown",
          userUsername: payload.userUsername || "",
          action: "Clear Reports",
          detail: "All reports cleared",
        });
        audit.entries = audit.entries.slice(0, 200);
        await env.AUDIT.put("audit", JSON.stringify(audit));
        return jsonResponse({ ok: true });
      }
      return jsonResponse({ ok: false }, 400);
    }

    return env.ASSETS.fetch(request);
  },
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
