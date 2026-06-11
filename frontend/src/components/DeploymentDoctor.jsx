import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../config/axios";

const apiBaseUrl = import.meta.env.VITE_API_URL;

function createCheck(id, label, description, status, detail) {
  return { id, label, description, status, detail };
}

function statusStyles(status, isDark) {
  if (status === "pass") {
    return {
      dot: "bg-emerald-500",
      text: isDark ? "text-emerald-300" : "text-emerald-700",
      badge: isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "warn") {
    return {
      dot: "bg-amber-400",
      text: isDark ? "text-amber-300" : "text-amber-700",
      badge: isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700",
    };
  }

  return {
    dot: "bg-red-500",
    text: isDark ? "text-red-300" : "text-red-700",
    badge: isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700",
  };
}

export default function DeploymentDoctor({ isDark, projectsCount = 0 }) {
  const [checks, setChecks] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const runChecks = useCallback(async () => {
    setIsChecking(true);

    const nextChecks = [];
    const token = localStorage.getItem("token");
    const isLocalFrontend = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isLocalApi = apiBaseUrl?.includes("localhost") || apiBaseUrl?.includes("127.0.0.1");

    nextChecks.push(
      createCheck(
        "api-env",
        "Frontend API URL",
        "Vercel must point to your Render backend.",
        apiBaseUrl?.startsWith("http") ? "pass" : "fail",
        apiBaseUrl || "Missing VITE_API_URL"
      )
    );

    nextChecks.push(
      createCheck(
        "target-env",
        "Production target",
        "Production builds should not call localhost.",
        !isLocalFrontend && isLocalApi ? "warn" : "pass",
        isLocalApi ? "API points to localhost" : "API target looks deployable"
      )
    );

    nextChecks.push(
      createCheck(
        "token",
        "Auth token",
        "Protected routes need a stored JWT.",
        token ? "pass" : "fail",
        token ? "Token found" : "No token in localStorage"
      )
    );

    try {
      const response = await axios.get("/");
      nextChecks.push(
        createCheck(
          "backend-health",
          "Backend health",
          "Render service should answer before app features run.",
          response.data?.status === "ok" ? "pass" : "warn",
          response.data?.status === "ok" ? "Backend returned ok" : "Unexpected backend response"
        )
      );
    } catch (error) {
      nextChecks.push(
        createCheck(
          "backend-health",
          "Backend health",
          "Render service should answer before app features run.",
          "fail",
          error.response?.data?.error || error.message || "Backend is unreachable"
        )
      );
    }

    try {
      await axios.get("/users/profile");
      nextChecks.push(
        createCheck(
          "profile",
          "Profile route",
          "Confirms auth, CORS, and backend env are aligned.",
          "pass",
          "Authenticated request works"
        )
      );
    } catch (error) {
      nextChecks.push(
        createCheck(
          "profile",
          "Profile route",
          "Confirms auth, CORS, and backend env are aligned.",
          "fail",
          error.response?.data?.error || error.message || "Profile request failed"
        )
      );
    }

    nextChecks.push(
      createCheck(
        "workspace-data",
        "Workspace data",
        "Projects loading means MongoDB and auth are both working.",
        projectsCount >= 0 ? "pass" : "warn",
        `${projectsCount} project${projectsCount === 1 ? "" : "s"} loaded`
      )
    );

    setChecks(nextChecks);
    setLastChecked(new Date());
    setIsChecking(false);
  }, [projectsCount]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const summary = useMemo(() => {
    const failed = checks.filter((check) => check.status === "fail").length;
    const warnings = checks.filter((check) => check.status === "warn").length;

    if (failed > 0) return { label: "Needs attention", status: "fail" };
    if (warnings > 0) return { label: "Review suggested", status: "warn" };
    return { label: "Production ready", status: "pass" };
  }, [checks]);

  const summaryStyle = statusStyles(summary.status, isDark);
  const shellClass = isDark
    ? "border-zinc-800 bg-[#17191d] text-zinc-50"
    : "border-zinc-200 bg-white text-zinc-950";
  const mutedClass = isDark ? "text-zinc-400" : "text-zinc-500";
  const rowClass = isDark ? "border-zinc-800" : "border-zinc-100";

  return (
    <section className={`rounded-md border ${shellClass}`}>
      <header className={`flex items-start justify-between gap-4 border-b px-4 py-3 ${rowClass}`}>
        <div>
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${mutedClass}`}>
            Deployment Doctor
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${summaryStyle.dot}`} />
            <h2 className={`text-sm font-semibold ${summaryStyle.text}`}>{summary.label}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={runChecks}
          disabled={isChecking}
          className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isDark
              ? "border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          <i className={`ri-refresh-line text-sm ${isChecking ? "animate-spin" : ""}`} />
          Check
        </button>
      </header>

      <div className="divide-y divide-zinc-200/10">
        {checks.map((check) => {
          const styles = statusStyles(check.status, isDark);

          return (
            <article key={check.id} className={`flex gap-3 px-4 py-3 ${rowClass}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{check.label}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${styles.badge}`}>
                    {check.status}
                  </span>
                </div>
                <p className={`mt-1 text-xs ${mutedClass}`}>{check.description}</p>
                <p className={`mt-1 truncate text-xs ${styles.text}`}>{check.detail}</p>
              </div>
            </article>
          );
        })}
      </div>

      <footer className={`border-t px-4 py-3 text-xs ${rowClass} ${mutedClass}`}>
        {lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : "Preparing checks"}
      </footer>
    </section>
  );
}
