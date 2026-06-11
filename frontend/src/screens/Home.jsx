import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/theme.context.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import DeploymentDoctor from "../components/DeploymentDoctor.jsx";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isDark } = useTheme();

  const themeClass = {
    page: isDark ? "bg-[#101114] text-zinc-50" : "bg-[#f6f5f2] text-zinc-950",
    border: isDark ? "border-zinc-800" : "border-zinc-200",
    surface: isDark ? "border-zinc-800 bg-[#17191d]" : "border-zinc-200 bg-white",
    softSurface: isDark ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-700",
    cardHover: isDark
      ? "hover:border-zinc-600 hover:bg-[#1d2026]"
      : "hover:border-zinc-300 hover:bg-zinc-50",
    dashed: isDark
      ? "border-zinc-700 bg-[#17191d] hover:border-zinc-500 hover:bg-[#1d2026]"
      : "border-zinc-300 bg-white hover:border-zinc-500 hover:bg-zinc-50",
    textMuted: isDark ? "text-zinc-400" : "text-zinc-500",
    primaryButton: isDark
      ? "bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
      : "bg-zinc-950 text-white hover:bg-zinc-800",
    ghostButton: isDark
      ? "border-zinc-700 text-zinc-200 hover:bg-zinc-800"
      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50",
    modal: isDark ? "border-zinc-800 bg-[#17191d]" : "border-zinc-200 bg-white",
    input: isDark
      ? "border-zinc-700 bg-[#101114] text-zinc-50 focus:border-zinc-300"
      : "border-zinc-300 bg-white text-zinc-950 focus:border-zinc-950",
  };

  const totalCollaborators = useMemo(
    () =>
      projects.reduce((count, currentProject) => {
        return count + (currentProject.users?.length || 0);
      }, 0),
    [projects]
  );

  function createProject(e) {
    e.preventDefault();

    const name = projectName.trim();
    if (!name) return;

    setIsCreating(true);
    setError("");

    axios
      .post("/projects/create", { name })
      .then((res) => {
        setProjects((prev) => [...prev, res.data]);
        setProjectName("");
        setIsModalOpen(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.response?.data || "Could not create project");
      })
      .finally(() => {
        setIsCreating(false);
      });
  }

  function logout() {
    axios
      .get("/users/logout")
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login", { replace: true });
      });
  }

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        setProjects(res.data.projects || []);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Could not load projects");
      });
  }, []);

  return (
    <main className={`min-h-screen transition-colors ${themeClass.page}`}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8">
        <header className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${themeClass.border}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${themeClass.primaryButton}`}>
              SO
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-[0.16em] ${themeClass.textMuted}`}>
                Workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">SOEN</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium">{user?.email || "Signed in"}</p>
              <p className={`text-xs ${themeClass.textMuted}`}>Active session</p>
            </div>

            <ThemeToggle />

            <button
              onClick={logout}
              className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${themeClass.ghostButton}`}
            >
              <i className="ri-logout-box-r-line text-base" />
              Logout
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${themeClass.primaryButton}`}
            >
              <i className="ri-add-line text-base" />
              New Project
            </button>
          </div>
        </header>

        <section className="grid gap-4 py-6 sm:grid-cols-3">
          <div className={`rounded-md border px-4 py-3 ${themeClass.surface}`}>
            <p className={`text-xs font-medium uppercase tracking-[0.14em] ${themeClass.textMuted}`}>Projects</p>
            <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
          </div>
          <div className={`rounded-md border px-4 py-3 ${themeClass.surface}`}>
            <p className={`text-xs font-medium uppercase tracking-[0.14em] ${themeClass.textMuted}`}>Collaborators</p>
            <p className="mt-2 text-2xl font-semibold">{totalCollaborators}</p>
          </div>
          <div className={`rounded-md border px-4 py-3 ${themeClass.surface}`}>
            <p className={`text-xs font-medium uppercase tracking-[0.14em] ${themeClass.textMuted}`}>Backend</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Connected
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {typeof error === "string" ? error : "Something went wrong"}
          </div>
        )}

        <section className="flex flex-1 flex-col">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
              <p className={`text-sm ${themeClass.textMuted}`}>Open a workspace or start a fresh one.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex min-h-36 flex-col justify-between rounded-md border border-dashed p-4 text-left transition ${themeClass.dashed}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-md ${themeClass.softSurface}`}>
                <i className="ri-add-line text-xl" />
              </span>
              <span>
                <span className="block text-sm font-semibold">New Project</span>
                <span className={`mt-1 block text-sm ${themeClass.textMuted}`}>Create an empty collaboration space.</span>
              </span>
            </button>

            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => {
                  navigate("/project", {
                    state: { project },
                  });
                }}
                className={`group flex min-h-36 flex-col justify-between rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${themeClass.surface} ${themeClass.cardHover}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold capitalize tracking-tight">
                      {project.name}
                    </h3>
                    <p className={`mt-1 text-sm ${themeClass.textMuted}`}>
                      {project.users?.length || 0} collaborator{project.users?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${themeClass.softSurface}`}>
                    <i className="ri-arrow-right-line" />
                  </span>
                </div>

                <div className={`flex items-center justify-between border-t pt-3 text-xs ${themeClass.border} ${themeClass.textMuted}`}>
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-code-s-slash-line" />
                    Workspace
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-user-3-line" />
                    Team
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <DeploymentDoctor isDark={isDark} projectsCount={projects.length} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className={`w-full max-w-md rounded-md border shadow-xl ${themeClass.modal}`}>
            <header className={`flex items-center justify-between border-b px-5 py-4 ${themeClass.border}`}>
              <div>
                <h2 className="text-base font-semibold">New Project</h2>
                <p className={`text-sm ${themeClass.textMuted}`}>Name it before opening the workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.textMuted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
              >
                <i className="ri-close-line text-xl" />
              </button>
            </header>

            <form onSubmit={createProject} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Project name</span>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className={`mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none transition ${themeClass.input}`}
                  required
                  autoFocus
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={`h-10 rounded-md border px-4 text-sm font-medium transition ${themeClass.ghostButton}`}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`h-10 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${themeClass.primaryButton}`}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
