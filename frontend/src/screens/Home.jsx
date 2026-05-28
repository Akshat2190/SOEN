import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
    <main className="min-h-screen bg-[#f6f5f2] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white">
              SO
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">SOEN</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium">{user?.email || "Signed in"}</p>
              <p className="text-xs text-zinc-500">Active session</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <i className="ri-add-line text-base" />
              New Project
            </button>
          </div>
        </header>

        <section className="grid gap-4 py-6 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Projects</p>
            <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Collaborators</p>
            <p className="mt-2 text-2xl font-semibold">{totalCollaborators}</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Backend</p>
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
              <p className="text-sm text-zinc-500">Open a workspace or start a fresh one.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex min-h-36 flex-col justify-between rounded-md border border-dashed border-zinc-300 bg-white p-4 text-left transition hover:border-zinc-500 hover:bg-zinc-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                <i className="ri-add-line text-xl" />
              </span>
              <span>
                <span className="block text-sm font-semibold">New Project</span>
                <span className="mt-1 block text-sm text-zinc-500">Create an empty collaboration space.</span>
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
                className="group flex min-h-36 flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold capitalize tracking-tight">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {project.users?.length || 0} collaborator{project.users?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 transition group-hover:bg-zinc-950 group-hover:text-white">
                    <i className="ri-arrow-right-line" />
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-md border border-zinc-200 bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">New Project</h2>
                <p className="text-sm text-zinc-500">Name it before opening the workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </header>

            <form onSubmit={createProject} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Project name</span>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950"
                  required
                  autoFocus
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
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
