import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import {
  disconnectSocket,
  initializeSocket,
  receiveMessage,
  removeMessageListener,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from "markdown-to-jsx";
import { getWebContainer } from "../config/webContainer.js";
import { useTheme } from "../context/theme.context.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && window.hljs) {
      window.hljs.highlightElement(ref.current);
    }
  }, [props.children]);

  return <code {...props} ref={ref} />;
}

const getUserId = (projectUser) =>
  typeof projectUser === "string" ? projectUser : projectUser?._id;

const getLanguage = (filename = "") => {
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) return "javascript";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".html")) return "html";
  if (filename.endsWith(".json")) return "json";
  return "plaintext";
};

const highlightContents = (filename, contents) => {
  if (!window?.hljs) return contents;

  try {
    return window.hljs.highlight(contents, { language: getLanguage(filename) }).value;
  } catch (err) {
    console.error("hljs highlight failed", err);
    return contents;
  }
};

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { isDark } = useTheme();
  const routeProject = location.state?.project;

  const themeClass = {
    page: isDark ? "bg-[#101114] text-zinc-50" : "bg-[#f6f5f2] text-zinc-950",
    surface: isDark ? "border-zinc-800 bg-[#17191d]" : "border-zinc-200 bg-white",
    surfaceAlt: isDark ? "border-zinc-800 bg-[#111318]" : "border-zinc-200 bg-[#fbfaf8]",
    border: isDark ? "border-zinc-800" : "border-zinc-200",
    soft: isDark ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-700",
    muted: isDark ? "text-zinc-400" : "text-zinc-500",
    primary: isDark
      ? "bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
      : "bg-zinc-950 text-white hover:bg-zinc-800",
    ghost: isDark
      ? "border-zinc-700 text-zinc-200 hover:bg-zinc-800"
      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50",
    input: isDark
      ? "border-zinc-700 bg-[#101114] text-zinc-50 focus:border-zinc-300"
      : "border-zinc-300 bg-white text-zinc-950 focus:border-zinc-950",
    empty: isDark
      ? "border-zinc-700 bg-[#111318] text-zinc-400"
      : "border-zinc-300 bg-zinc-50 text-zinc-500",
  };

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(routeProject || null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [aiError, setAiError] = useState(null);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const messageBoxRef = useRef(null);
  const codeRef = useRef(null);
  const runProcessRef = useRef(null);
  const webContainerRef = useRef(null);
  const didLoadProjectRef = useRef(false);

  const fileNames = useMemo(() => Object.keys(fileTree || {}), [fileTree]);
  const availableUsers = useMemo(() => {
    const collaboratorIds = new Set((project?.users || []).map(getUserId));
    return users.filter((candidate) => !collaboratorIds.has(candidate._id));
  }, [project?.users, users]);

  useEffect(() => {
    webContainerRef.current = webContainer;
  }, [webContainer]);

  useEffect(() => {
    if (!project?._id) {
      navigate("/", { replace: true });
      return;
    }

    initializeSocket(project._id);

    if (!webContainerRef.current) {
      getWebContainer()
        .then((container) => {
          setWebContainer(container);
        })
        .catch((error) => {
          console.error("Failed to initialize WebContainer:", error);
        });
    }

    const handleProjectMessage = (data) => {
      if (data.sender?._id === "ai") {
        try {
          const parsedMessage = JSON.parse(data.message);

          if (parsedMessage.fileTree) {
            webContainerRef.current?.mount(parsedMessage.fileTree);
            setFileTree(parsedMessage.fileTree);
            setAiError(null);
          }
        } catch (error) {
          console.error("Error parsing AI message:", error);
          setAiError("Could not process the AI response.");
        }
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    };

    receiveMessage("project-message", handleProjectMessage);

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        const fetchedProject = res.data.project;
        const fetchedFileTree = fetchedProject?.fileTree || {};
        const fetchedFiles = Object.keys(fetchedFileTree);

        setProject(fetchedProject);
        setFileTree(fetchedFileTree);
        setOpenFiles(fetchedFiles);
        setCurrentFile((prevFile) => prevFile || fetchedFiles[0] || null);
        didLoadProjectRef.current = true;
      })
      .catch((error) => {
        console.error("Failed to load project:", error);
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
      });

    if (window.hljs) {
      window.hljs.configure({ ignoreUnescapedHTML: true });
    }

    return () => {
      removeMessageListener("project-message", handleProjectMessage);
      disconnectSocket();
    };
  }, [project?._id, navigate]);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const saveFileTree = useCallback(
    (nextFileTree) => {
      if (!didLoadProjectRef.current) return;
      if (!project?._id) return;

      axios
        .put("/projects/update-file-tree", {
          projectId: project._id,
          fileTree: nextFileTree,
        })
        .catch((err) => {
          console.error("Failed to update file tree:", err);
        });
    },
    [project?._id]
  );

  useEffect(() => {
    if (!didLoadProjectRef.current) return;
    if (!currentFile || !fileTree[currentFile]) return;

    const timeoutId = setTimeout(() => {
      saveFileTree(fileTree);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fileTree, currentFile, saveFileTree]);

  const handleOpenFile = (file) => {
    setCurrentFile(file);
    setOpenFiles((prevFiles) => [...new Set([...prevFiles, file])]);
  };

  const updateCurrentFileContents = (contents) => {
    if (!currentFile || !fileTree[currentFile]) return;

    setFileTree((prevTree) => ({
      ...prevTree,
      [currentFile]: {
        ...prevTree[currentFile],
        file: {
          ...prevTree[currentFile].file,
          contents,
        },
      },
    }));
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const nextSelectedUserId = new Set(prevSelectedUserId);

      if (nextSelectedUserId.has(id)) {
        nextSelectedUserId.delete(id);
      } else {
        nextSelectedUserId.add(id);
      }

      return nextSelectedUserId;
    });
  };

  const addCollaborators = () => {
    const projectId = project?._id;
    if (!projectId) return;

    axios
      .put("/projects/add-user", {
        projectId,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        setProject(res.data.project);
        setSelectedUserId(new Set());
        setIsModalOpen(false);
      })
      .catch(console.error);
  };

  const send = () => {
    if (!message.trim()) return;

    const messageData = {
      message,
      sender: user,
    };

    sendMessage("project-message", messageData);
    setMessages((prev) => [...prev, { ...messageData, isOutgoing: true }]);
    setMessage("");
  };

  const handleRunProject = async () => {
    if (!webContainer) {
      console.error("WebContainer is not ready yet");
      return;
    }

    const paths = Object.keys(fileTree || {});
    if (!paths.length) {
      console.error("No files available to run");
      return;
    }

    setIsRunning(true);

    try {
      if (runProcessRef.current) {
        runProcessRef.current.kill();
        runProcessRef.current = null;
      }

      await webContainer.mount(fileTree);

      const packageJsonPath = paths.find((path) => path.endsWith("package.json"));
      if (!packageJsonPath) {
        console.error("No package.json found in generated files");
        return;
      }

      const workingDirectory = packageJsonPath.includes("/")
        ? packageJsonPath.split("/").slice(0, -1).join("/")
        : ".";

      let runArgs = ["start"];
      try {
        const packageJson = JSON.parse(fileTree[packageJsonPath]?.file?.contents || "{}");
        if (!packageJson?.scripts?.start && packageJson?.scripts?.dev) {
          runArgs = ["run", "dev"];
        }
      } catch (error) {
        console.error("Failed to parse package.json:", error);
      }

      const installProcess = await webContainer.spawn("npm", ["install"], {
        cwd: workingDirectory,
      });

      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          },
        })
      );

      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        console.error("npm install failed", installExitCode);
        return;
      }

      try {
        const killProcess = await webContainer.spawn("npx", ["--yes", "kill-port", "3000"], {
          cwd: workingDirectory,
        });

        killProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(chunk);
            },
          })
        );

        try {
          await killProcess.exit;
        } catch (error) {
          console.warn("kill-port failed", error);
        }
      } catch (error) {
        console.warn("Failed to spawn kill command", error);
      }

      const runProcess = await webContainer.spawn("npm", runArgs, {
        cwd: workingDirectory,
      });

      runProcessRef.current = runProcess;

      runProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          },
        })
      );

      runProcess.exit.finally(() => {
        if (runProcessRef.current === runProcess) {
          runProcessRef.current = null;
        }
        setIsRunning(false);
      });

      webContainer.on("server-ready", (port, url) => {
        console.log(port, url);
        setIframeUrl(url);
      });
    } catch (error) {
      console.error("Failed to run project:", error);
      setIsRunning(false);
    }
  };

  const renderAiMessage = (rawMessage) => {
    try {
      const messageObject = JSON.parse(rawMessage);

      return (
        <div className="overflow-auto rounded-md bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-50">
          <Markdown
            options={{
              overrides: {
                code: SyntaxHighlightedCode,
              },
            }}
          >
            {messageObject.text || rawMessage}
          </Markdown>
        </div>
      );
    } catch {
      return <p className="text-sm leading-relaxed">{rawMessage}</p>;
    }
  };

  if (!project) {
    return (
      <main className={`flex h-screen w-screen items-center justify-center text-sm ${themeClass.page} ${themeClass.muted}`}>
        Loading workspace...
      </main>
    );
  }

  return (
    <main className={`flex h-screen w-screen overflow-hidden transition-colors ${themeClass.page}`}>
      <aside className={`relative flex h-full w-[360px] shrink-0 flex-col border-r ${themeClass.surface}`}>
        <header className={`border-b px-4 py-4 ${themeClass.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs font-medium uppercase tracking-[0.14em] ${themeClass.muted}`}>
                Project
              </p>
              <h1 className="truncate text-lg font-semibold capitalize tracking-tight">
                {project.name}
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.muted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
              title="Back"
            >
              <i className="ri-arrow-left-line text-lg" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${themeClass.primary}`}
            >
              <i className="ri-user-add-line" />
              Add
            </button>
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition ${themeClass.ghost}`}
            >
              <i className="ri-group-line" />
              Team
            </button>
          </div>
        </header>

        <div
          ref={messageBoxRef}
          className="message-box flex-1 space-y-3 overflow-y-auto px-3 py-4"
        >
          {messages.length === 0 && (
            <div className={`rounded-md border border-dashed p-4 text-sm ${themeClass.empty}`}>
              Start with a note or mention @ai.
            </div>
          )}

          {messages.map((msg, index) => {
            const isMine = msg.sender?._id === user?._id || msg.isOutgoing;
            const isAi = msg.sender?._id === "ai";

            return (
              <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[86%] rounded-md border px-3 py-2 ${
                    isMine
                      ? isDark
                        ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                        : "border-zinc-950 bg-zinc-950 text-white"
                      : isDark
                        ? "border-zinc-800 bg-[#111318] text-zinc-50"
                        : "border-zinc-200 bg-white text-zinc-950"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] opacity-60">
                    <span>{isAi ? "AI" : msg.sender?.email || "User"}</span>
                  </div>
                  {isAi ? renderAiMessage(msg.message) : <p className="text-sm">{msg.message}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {aiError && (
          <div className="mx-3 mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {aiError}
          </div>
        )}

        <div className={`border-t p-3 ${themeClass.border}`}>
          <div className={`flex items-center gap-2 rounded-md border px-2 py-2 ${themeClass.input}`}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              type="text"
              placeholder="Message"
            />
            <button
              onClick={send}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.primary}`}
              title="Send"
            >
              <i className="ri-send-plane-2-line" />
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 z-20 flex flex-col transition-transform duration-200 ${isDark ? "bg-[#17191d]" : "bg-white"} ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className={`flex items-center justify-between border-b px-4 py-4 ${themeClass.border}`}>
            <div>
              <h2 className="text-base font-semibold">Collaborators</h2>
              <p className={`text-sm ${themeClass.muted}`}>{project.users?.length || 0} people</p>
            </div>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.muted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
            >
              <i className="ri-close-line text-xl" />
            </button>
          </header>

          <div className="space-y-2 overflow-y-auto p-3">
            {(project.users || []).map((projectUser) => (
              <div
                key={getUserId(projectUser)}
                className={`flex items-center gap-3 rounded-md border px-3 py-3 ${themeClass.surfaceAlt}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold ${themeClass.primary}`}>
                  {(projectUser.email || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{projectUser.email || "Collaborator"}</p>
                  <p className={`text-xs ${themeClass.muted}`}>Member</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 ${themeClass.surface}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md ${themeClass.soft}`}>
              <i className="ri-folder-3-line" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold capitalize">{project.name}</p>
              <p className={`text-xs ${themeClass.muted}`}>{fileNames.length} files</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleRunProject}
              disabled={isRunning || !fileNames.length}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className={isRunning ? "ri-loader-4-line animate-spin" : "ri-play-fill"} />
              {isRunning ? "Running" : "Run"}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className={`hidden h-full w-60 shrink-0 border-r md:block ${themeClass.surfaceAlt}`}>
            <div className={`flex h-11 items-center justify-between border-b px-3 ${themeClass.border}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${themeClass.muted}`}>
                Files
              </p>
            </div>

            <div className="p-2">
              {fileNames.length === 0 && (
                <div className={`rounded-md border border-dashed p-3 text-sm ${themeClass.empty}`}>
                  No files yet.
                </div>
              )}

              {fileNames.map((file) => (
                <button
                  key={file}
                  onClick={() => handleOpenFile(file)}
                  className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm transition ${
                    currentFile === file
                      ? isDark
                        ? "bg-zinc-50 text-zinc-950"
                        : "bg-zinc-950 text-white"
                      : isDark
                        ? "text-zinc-300 hover:bg-zinc-800"
                        : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <i className="ri-file-code-line shrink-0" />
                  <span className="truncate">{file}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className={`flex min-w-0 flex-1 flex-col ${isDark ? "bg-[#17191d]" : "bg-white"}`}>
            <div className={`flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b px-2 ${themeClass.surfaceAlt}`}>
              {openFiles.length === 0 ? (
                <p className={`px-2 text-sm ${themeClass.muted}`}>No file selected</p>
              ) : (
                openFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => setCurrentFile(file)}
                    className={`flex h-8 max-w-48 items-center gap-2 rounded-md px-3 text-sm transition ${
                      currentFile === file
                        ? isDark
                          ? "bg-[#17191d] text-zinc-50 shadow-sm ring-1 ring-zinc-700"
                          : "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200"
                        : isDark
                          ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <span className="truncate">{file}</span>
                  </button>
                ))
              )}
            </div>

            <div className="min-h-0 flex-1">
              {currentFile && fileTree[currentFile] ? (
                <pre className="h-full w-full overflow-auto bg-[#101214] p-4 text-sm leading-6 text-zinc-100">
                  <code
                    key={currentFile}
                    ref={codeRef}
                    className="hljs block min-h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      updateCurrentFileContents(e.target.innerText);
                    }}
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      updateCurrentFileContents(updatedContent);
                      e.target.innerHTML = highlightContents(currentFile, updatedContent);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightContents(
                        currentFile,
                        fileTree[currentFile].file.contents || ""
                      ),
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "18rem",
                    }}
                  />
                </pre>
              ) : (
                <div className={`flex h-full items-center justify-center ${isDark ? "bg-[#17191d]" : "bg-white"}`}>
                  <div className={`max-w-sm rounded-md border border-dashed p-6 text-center ${themeClass.empty}`}>
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-md ${themeClass.soft}`}>
                      <i className="ri-file-code-line text-xl" />
                    </div>
                    <p className="mt-3 text-sm font-medium">No file open</p>
                    <p className={`mt-1 text-sm ${themeClass.muted}`}>Ask AI to create files or select one.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {iframeUrl && webContainer && (
            <aside className={`hidden h-full w-[420px] shrink-0 flex-col border-l xl:flex ${themeClass.surface}`}>
              <div className={`flex h-11 items-center gap-2 border-b px-3 ${themeClass.border}`}>
                <i className={`ri-global-line ${themeClass.muted}`} />
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className={`h-8 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none ${themeClass.input}`}
                />
              </div>
              <iframe src={iframeUrl} className="h-full w-full" title="Preview" />
            </aside>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className={`w-full max-w-md rounded-md border shadow-xl ${themeClass.surface}`}>
            <header className={`flex items-center justify-between border-b px-5 py-4 ${themeClass.border}`}>
              <div>
                <h2 className="text-base font-semibold">Add Collaborators</h2>
                <p className={`text-sm ${themeClass.muted}`}>{availableUsers.length} available</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.muted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
              >
                <i className="ri-close-line text-xl" />
              </button>
            </header>

            <div className="max-h-96 space-y-2 overflow-auto p-3">
              {availableUsers.map((candidate) => (
                <button
                  key={candidate._id}
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition ${
                    selectedUserId.has(candidate._id)
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : isDark
                        ? "border-zinc-800 bg-[#111318] hover:bg-zinc-800"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                  onClick={() => handleUserClick(candidate._id)}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold ${
                      selectedUserId.has(candidate._id)
                        ? "bg-white text-zinc-950"
                        : themeClass.soft
                    }`}
                  >
                    {candidate.email.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {candidate.email}
                  </span>
                  {selectedUserId.has(candidate._id) && <i className="ri-check-line" />}
                </button>
              ))}

              {availableUsers.length === 0 && (
                <div className={`rounded-md border border-dashed p-5 text-center text-sm ${themeClass.empty}`}>
                  No users available.
                </div>
              )}
            </div>

            <footer className={`flex justify-end gap-2 border-t px-5 py-4 ${themeClass.border}`}>
              <button
                type="button"
                className={`h-10 rounded-md border px-4 text-sm font-medium transition ${themeClass.ghost}`}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={!selectedUserId.size}
                onClick={addCollaborators}
                className={`h-10 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${themeClass.primary}`}
              >
                Add
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
