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
import Whiteboard from "../components/whiteboard/Whiteboard.jsx";

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

const parseJsonSafely = (value) => {
  if (typeof value !== "string") return null;

  const cleanedValue = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedValue);
  } catch (error) {
    void error;
  }

  const firstBrace = cleanedValue.indexOf("{");
  const lastBrace = cleanedValue.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(cleanedValue.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeFileContents = (name, contents) => {
  const value = typeof contents === "string" ? contents : String(contents ?? "");

  if (!name.endsWith("package.json")) return value;

  const candidates = [
    value,
    value.replace(/,\s*\\"/g, ', "'),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.stringify(JSON.parse(candidate), null, 2);
    } catch (error) {
      void error;
    }
  }

  return value;
};

const insertFileTreeNode = (tree, path, node) => {
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);

  if (!parts.length) return tree;

  let cursor = tree;

  parts.slice(0, -1).forEach((part) => {
    if (!isPlainObject(cursor[part]?.directory)) {
      cursor[part] = { directory: {} };
    }

    cursor = cursor[part].directory;
  });

  cursor[parts[parts.length - 1]] = node;
  return tree;
};

const sanitizeFileTreeNode = (node, name = "") => {
  if (typeof node === "string") {
    return {
      file: {
        contents: normalizeFileContents(name, node),
      },
    };
  }

  if (!isPlainObject(node)) return null;

  if (isPlainObject(node.file)) {
    return {
      file: {
        contents: normalizeFileContents(name, node.file.contents),
      },
    };
  }

  if ("contents" in node) {
    return {
      file: {
        contents: normalizeFileContents(name, node.contents),
      },
    };
  }

  if (isPlainObject(node.directory)) {
    const directory = sanitizeFileTree(node.directory);
    return Object.keys(directory).length ? { directory } : null;
  }

  const directory = sanitizeFileTree(node);
  return Object.keys(directory).length ? { directory } : null;
};

const sanitizeFileTree = (tree) => {
  if (!isPlainObject(tree)) return {};

  return Object.entries(tree).reduce((safeTree, [name, node]) => {
    const safeNode = sanitizeFileTreeNode(node, name);

    if (safeNode) {
      insertFileTreeNode(safeTree, name, safeNode);
    }

    return safeTree;
  }, {});
};

const aiMetadataKeys = new Set([
  "text",
  "fileTree",
  "buildCommand",
  "startCommand",
  "commands",
]);

const extractAiFileTree = (messageObject) => {
  if (!isPlainObject(messageObject)) return {};

  const safeTree = sanitizeFileTree(messageObject.fileTree || {});

  Object.entries(messageObject).forEach(([name, node]) => {
    if (aiMetadataKeys.has(name)) return;

    const safeNode = sanitizeFileTreeNode(node, name);
    if (safeNode) {
      insertFileTreeNode(safeTree, name, safeNode);
    }
  });

  return safeTree;
};

const listFileTreePaths = (tree, prefix = "") => {
  if (!isPlainObject(tree)) return [];

  return Object.entries(tree).flatMap(([name, node]) => {
    const path = prefix ? `${prefix}/${name}` : name;

    if (isPlainObject(node?.file)) return [path];
    if (isPlainObject(node?.directory)) return listFileTreePaths(node.directory, path);
    return [];
  });
};

const getFileTreeFile = (tree, path) => {
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  let cursor = tree;

  for (let index = 0; index < parts.length; index += 1) {
    const node = cursor?.[parts[index]];

    if (!node) return null;
    if (index === parts.length - 1) return node.file || null;

    cursor = node.directory;
  }

  return null;
};

const updateFileTreeFileContents = (tree, path, contents) => {
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  if (!parts.length) return tree;

  const nextTree = { ...tree };
  let cursor = nextTree;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const node = cursor[part];

    if (!node) return tree;

    if (index === parts.length - 1) {
      cursor[part] = {
        ...node,
        file: {
          ...node.file,
          contents,
        },
      };
      return nextTree;
    }

    cursor[part] = {
      ...node,
      directory: {
        ...node.directory,
      },
    };
    cursor = cursor[part].directory;
  }

  return nextTree;
};

const emptyProjectMemory = {
  goal: "",
  stack: "",
  decisions: [],
  knownIssues: [],
  deploymentNotes: [],
  nextSteps: [],
};

const memoryListFields = [
  { key: "decisions", label: "Decisions" },
  { key: "knownIssues", label: "Known Issues" },
  { key: "deploymentNotes", label: "Deployment Notes" },
  { key: "nextSteps", label: "Next Steps" },
];

const normalizeMemory = (memory = {}) => ({
  goal: memory.goal || "",
  stack: memory.stack || "",
  decisions: Array.isArray(memory.decisions) ? memory.decisions : [],
  knownIssues: Array.isArray(memory.knownIssues) ? memory.knownIssues : [],
  deploymentNotes: Array.isArray(memory.deploymentNotes) ? memory.deploymentNotes : [],
  nextSteps: Array.isArray(memory.nextSteps) ? memory.nextSteps : [],
});

const memoryToDraft = (memory) => {
  const normalizedMemory = normalizeMemory(memory);

  return {
    goal: normalizedMemory.goal,
    stack: normalizedMemory.stack,
    decisions: normalizedMemory.decisions.join("\n"),
    knownIssues: normalizedMemory.knownIssues.join("\n"),
    deploymentNotes: normalizedMemory.deploymentNotes.join("\n"),
    nextSteps: normalizedMemory.nextSteps.join("\n"),
  };
};

const draftToMemory = (draft) => ({
  goal: draft.goal,
  stack: draft.stack,
  decisions: draft.decisions.split("\n"),
  knownIssues: draft.knownIssues.split("\n"),
  deploymentNotes: draft.deploymentNotes.split("\n"),
  nextSteps: draft.nextSteps.split("\n"),
});

const memoryCapturePattern =
  /\b(remember|decided|decision|bug|issue|risk|deploy|deployment|production|vercel|render|mongodb|redis|socket|cors|env|environment|stack|todo|next step|use|using|switch)\b/i;

const shouldCaptureMemory = (text = "") => memoryCapturePattern.test(text);

const uniqueList = (items = []) => {
  const seen = new Set();

  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
};

const mergeMemoryPatch = (currentMemory, patch) => {
  const current = normalizeMemory(currentMemory);

  return normalizeMemory({
    goal: patch.goal || current.goal,
    stack: patch.stack || current.stack,
    decisions: uniqueList([...(current.decisions || []), ...(patch.decisions || [])]),
    knownIssues: uniqueList([...(current.knownIssues || []), ...(patch.knownIssues || [])]),
    deploymentNotes: uniqueList([
      ...(current.deploymentNotes || []),
      ...(patch.deploymentNotes || []),
    ]),
    nextSteps: uniqueList([...(current.nextSteps || []), ...(patch.nextSteps || [])]),
  });
};

const getMemoryPatchEntries = (patch = {}) => {
  const entries = [];

  if (patch.goal) entries.push({ label: "Goal", values: [patch.goal] });
  if (patch.stack) entries.push({ label: "Stack", values: [patch.stack] });

  memoryListFields.forEach((field) => {
    if (Array.isArray(patch[field.key]) && patch[field.key].length) {
      entries.push({ label: field.label, values: patch[field.key] });
    }
  });

  return entries;
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
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(routeProject || null);
  const [projectMemory, setProjectMemory] = useState(() =>
    normalizeMemory(routeProject?.memory || emptyProjectMemory)
  );
  const [memoryDraft, setMemoryDraft] = useState(() =>
    memoryToDraft(routeProject?.memory || emptyProjectMemory)
  );
  const [memoryStatus, setMemoryStatus] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [isGeneratingMemory, setIsGeneratingMemory] = useState(false);
  const [memorySuggestion, setMemorySuggestion] = useState(null);
  const [isSuggestingMemory, setIsSuggestingMemory] = useState(false);
  const [isApplyingMemorySuggestion, setIsApplyingMemorySuggestion] = useState(false);
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
  const [activeWorkspace, setActiveWorkspace] = useState("code");
  const [whiteboardMode, setWhiteboardMode] = useState("canvas");
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [projectSocket, setProjectSocket] = useState(null);

  const messageBoxRef = useRef(null);
  const codeRef = useRef(null);
  const runProcessRef = useRef(null);
  const webContainerRef = useRef(null);
  const didLoadProjectRef = useRef(false);

  const fileNames = useMemo(() => listFileTreePaths(fileTree), [fileTree]);
  const currentFileData = useMemo(
    () => (currentFile ? getFileTreeFile(fileTree, currentFile) : null),
    [currentFile, fileTree]
  );
  const availableUsers = useMemo(() => {
    const collaboratorIds = new Set((project?.users || []).map(getUserId));
    return users.filter((candidate) => !collaboratorIds.has(candidate._id));
  }, [project?.users, users]);
  const memoryItemCount = useMemo(
    () =>
      memoryListFields.reduce((count, field) => {
        return count + (projectMemory[field.key]?.length || 0);
      }, 0),
    [projectMemory]
  );
  const memorySuggestionEntries = useMemo(
    () => getMemoryPatchEntries(memorySuggestion?.memory),
    [memorySuggestion]
  );

  const requestMemorySuggestion = useCallback(
    ({ content, eventType = "message" }) => {
      if (!project?._id || !content?.trim()) return;

      setIsSuggestingMemory(true);

      axios
        .post("/projects/suggest-memory", {
          projectId: project._id,
          eventType,
          content,
        })
        .then((res) => {
          if (res.data?.shouldSuggest) {
            setMemorySuggestion({
              reason: res.data.reason || "SOEN noticed durable project context.",
              memory: normalizeMemory(res.data.memory || {}),
            });
          }
        })
        .catch((error) => {
          console.error("Failed to suggest memory:", error);
        })
        .finally(() => {
          setIsSuggestingMemory(false);
        });
    },
    [project?._id]
  );

  useEffect(() => {
    webContainerRef.current = webContainer;
  }, [webContainer]);

  useEffect(() => {
    if (!project?._id) {
      navigate("/", { replace: true });
      return;
    }

    const socket = initializeSocket(project._id);
    setProjectSocket(socket);

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
        const parsedMessage = parseJsonSafely(data.message);

        if (parsedMessage?.fileTree) {
          const safeFileTree = extractAiFileTree(parsedMessage);
          const safeFileNames = listFileTreePaths(safeFileTree);

          if (!safeFileNames.length) {
            setAiError("AI returned files in an unsupported format.");
            setMessages((prevMessages) => [...prevMessages, data]);
            return;
          }

          webContainerRef.current?.mount(safeFileTree);
          setFileTree(safeFileTree);
          setOpenFiles(safeFileNames);
          setCurrentFile((prevFile) =>
            prevFile && safeFileNames.includes(prevFile) ? prevFile : safeFileNames[0] || null
          );
          setAiError(null);
          requestMemorySuggestion({
            eventType: "ai-file-generation",
            content: `AI generated or updated files: ${safeFileNames.join(", ")}. ${parsedMessage.text || ""}`,
          });
        }
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    };

    receiveMessage("project-message", handleProjectMessage);

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        const fetchedProject = res.data.project;
        const fetchedFileTree = sanitizeFileTree(fetchedProject?.fileTree || {});
        const fetchedFiles = listFileTreePaths(fetchedFileTree);

        setProject(fetchedProject);
        setProjectMemory(normalizeMemory(fetchedProject?.memory || emptyProjectMemory));
        setMemoryDraft(memoryToDraft(fetchedProject?.memory || emptyProjectMemory));
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
      setProjectSocket(null);
    };
  }, [project?._id, navigate, requestMemorySuggestion]);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeWorkspace === "split") {
      setIsChatCollapsed(true);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (!project?._id) return;
    setDocumentContent(localStorage.getItem(`soen-document:${project._id}`) || "");
  }, [project?._id]);

  useEffect(() => {
    if (!project?._id) return;
    localStorage.setItem(`soen-document:${project._id}`, documentContent);
  }, [documentContent, project?._id]);

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
    if (!currentFile || !currentFileData) return;

    const timeoutId = setTimeout(() => {
      saveFileTree(fileTree);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fileTree, currentFile, currentFileData, saveFileTree]);

  const handleOpenFile = (file) => {
    setCurrentFile(file);
    setOpenFiles((prevFiles) => [...new Set([...prevFiles, file])]);
  };

  const updateCurrentFileContents = (contents) => {
    if (!currentFile || !currentFileData) return;

    setFileTree((prevTree) => updateFileTreeFileContents(prevTree, currentFile, contents));
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

  const updateMemoryDraftField = (field, value) => {
    setMemoryDraft((prevDraft) => ({
      ...prevDraft,
      [field]: value,
    }));
  };

  const saveProjectMemory = () => {
    if (!project?._id) return;

    setIsSavingMemory(true);
    setMemoryStatus("");

    axios
      .put("/projects/update-memory", {
        projectId: project._id,
        memory: draftToMemory(memoryDraft),
      })
      .then((res) => {
        const nextMemory = normalizeMemory(res.data.memory || res.data.project?.memory);
        setProject(res.data.project);
        setProjectMemory(nextMemory);
        setMemoryDraft(memoryToDraft(nextMemory));
        setMemoryStatus("Memory saved");
      })
      .catch((error) => {
        setMemoryStatus(error.response?.data?.error || "Could not save memory");
      })
      .finally(() => {
        setIsSavingMemory(false);
      });
  };

  const generateProjectMemory = () => {
    if (!project?._id) return;

    setIsGeneratingMemory(true);
    setMemoryStatus("");

    axios
      .post("/projects/generate-memory", {
        projectId: project._id,
      })
      .then((res) => {
        const nextMemory = normalizeMemory(res.data.memory || res.data.project?.memory);
        setProject(res.data.project);
        setProjectMemory(nextMemory);
        setMemoryDraft(memoryToDraft(nextMemory));
        setMemoryStatus("Memory refreshed by AI");
      })
      .catch((error) => {
        setMemoryStatus(error.response?.data?.error || "Could not generate memory");
      })
      .finally(() => {
        setIsGeneratingMemory(false);
      });
  };

  const acceptMemorySuggestion = () => {
    if (!project?._id || !memorySuggestion?.memory) return;

    const nextMemory = mergeMemoryPatch(projectMemory, memorySuggestion.memory);
    setIsApplyingMemorySuggestion(true);

    axios
      .put("/projects/update-memory", {
        projectId: project._id,
        memory: nextMemory,
      })
      .then((res) => {
        const savedMemory = normalizeMemory(res.data.memory || res.data.project?.memory);
        setProject(res.data.project);
        setProjectMemory(savedMemory);
        setMemoryDraft(memoryToDraft(savedMemory));
        setMemorySuggestion(null);
        setMemoryStatus("Memory suggestion accepted");
      })
      .catch((error) => {
        setMemoryStatus(error.response?.data?.error || "Could not accept memory suggestion");
      })
      .finally(() => {
        setIsApplyingMemorySuggestion(false);
      });
  };

  const send = () => {
    const outgoingMessage = message.trim();
    if (!outgoingMessage) return;

    const messageData = {
      message: outgoingMessage,
      sender: user,
    };

    sendMessage("project-message", messageData);
    setMessages((prev) => [...prev, { ...messageData, isOutgoing: true }]);
    setMessage("");

    if (shouldCaptureMemory(outgoingMessage)) {
      requestMemorySuggestion({
        eventType: "user-message",
        content: outgoingMessage,
      });
    }
  };

  const handleRunProject = async () => {
    if (!webContainer) {
      console.error("WebContainer is not ready yet");
      return;
    }

    const safeFileTree = sanitizeFileTree(fileTree);
    const paths = listFileTreePaths(safeFileTree);
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

      await webContainer.mount(safeFileTree);

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
        const packageJson = JSON.parse(getFileTreeFile(safeFileTree, packageJsonPath)?.contents || "{}");
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
    const messageObject = parseJsonSafely(rawMessage);

    if (messageObject) {
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
    }

    return <p className="text-sm leading-relaxed">{rawMessage}</p>;
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
      <aside
        className={`relative flex h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 ${themeClass.surface} ${
          isChatCollapsed ? "w-16" : "w-[360px]"
        }`}
      >
        <header className={`border-b ${isChatCollapsed ? "px-2 py-3" : "px-4 py-4"} ${themeClass.border}`}>
          <div className={`flex gap-3 ${isChatCollapsed ? "flex-col items-center" : "items-start justify-between"}`}>
            <div className={`min-w-0 ${isChatCollapsed ? "hidden" : ""}`}>
              <p className={`text-xs font-medium uppercase tracking-[0.14em] ${themeClass.muted}`}>
                Project
              </p>
              <h1 className="truncate text-lg font-semibold capitalize tracking-tight">
                {project.name}
              </h1>
            </div>
            {isChatCollapsed && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${themeClass.primary}`}>
                {project.name?.slice(0, 1).toUpperCase() || "S"}
              </div>
            )}
            <button
              onClick={() => setIsChatCollapsed((value) => !value)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition ${themeClass.muted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
              title={isChatCollapsed ? "Expand AI chat" : "Shrink AI chat"}
            >
              <i className={`${isChatCollapsed ? "ri-sidebar-unfold-line" : "ri-sidebar-fold-line"} text-lg`} />
            </button>
          </div>

          <div className={`mt-4 grid gap-2 ${isChatCollapsed ? "grid-cols-1 place-items-center" : "grid-cols-3"}`}>
            <button
              onClick={() => {
                setIsChatCollapsed(false);
                setIsModalOpen(true);
              }}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium transition ${themeClass.primary} ${isChatCollapsed ? "w-10 px-0" : "px-3"}`}
              title="Add collaborator"
            >
              <i className="ri-user-add-line" />
              {!isChatCollapsed && "Add"}
            </button>
            <button
              onClick={() => {
                setIsChatCollapsed(false);
                setIsSidePanelOpen(true);
              }}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition ${themeClass.ghost} ${isChatCollapsed ? "w-10 px-0" : "px-3"}`}
              title="Team"
            >
              <i className="ri-group-line" />
              {!isChatCollapsed && "Team"}
            </button>
            <button
              onClick={() => {
                setIsChatCollapsed(false);
                setIsMemoryPanelOpen(true);
              }}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition ${themeClass.ghost} ${isChatCollapsed ? "w-10 px-0" : "px-3"}`}
              title="Memory"
            >
              <i className="ri-brain-line" />
              {!isChatCollapsed && "Memory"}
            </button>
          </div>
        </header>

        <section className={`border-b px-3 py-3 ${themeClass.border} ${isChatCollapsed ? "hidden" : ""}`}>
          <button
            type="button"
            onClick={() => setIsMemoryPanelOpen(true)}
            className={`w-full rounded-md border p-3 text-left transition ${themeClass.surfaceAlt} ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-50"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${themeClass.muted}`}>
                  Project Memory
                </p>
                <p className="mt-1 truncate text-sm font-medium">
                  {projectMemory.goal || "Add context so AI remembers this project"}
                </p>
              </div>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${themeClass.soft}`}>
                <i className="ri-arrow-right-line" />
              </span>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-xs ${themeClass.muted}`}>
              <i className="ri-brain-line" />
              <span>{memoryItemCount} saved notes</span>
            </div>
          </button>
        </section>

        <div
          ref={messageBoxRef}
          className={`message-box flex-1 space-y-3 overflow-y-auto px-3 py-4 ${isChatCollapsed ? "hidden" : ""}`}
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

          {(memorySuggestion || isSuggestingMemory) && (
            <div className="flex justify-start">
              <div className={`max-w-[92%] rounded-md border p-3 text-sm ${themeClass.surfaceAlt}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${themeClass.soft}`}>
                    <i className={isSuggestingMemory ? "ri-loader-4-line animate-spin" : "ri-brain-line"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {isSuggestingMemory ? "Checking for memory..." : "Memory update suggested"}
                    </p>
                    <p className={`mt-1 text-xs ${themeClass.muted}`}>
                      {memorySuggestion?.reason || "SOEN is checking whether this should be remembered."}
                    </p>

                    {memorySuggestionEntries.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {memorySuggestionEntries.map((entry) => (
                          <div key={entry.label}>
                            <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${themeClass.muted}`}>
                              {entry.label}
                            </p>
                            <ul className="mt-1 space-y-1">
                              {entry.values.map((value) => (
                                <li key={value} className="text-xs leading-relaxed">
                                  {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {memorySuggestion && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={acceptMemorySuggestion}
                          disabled={isApplyingMemorySuggestion}
                          className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${themeClass.primary}`}
                        >
                          <i className={isApplyingMemorySuggestion ? "ri-loader-4-line animate-spin" : "ri-check-line"} />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemorySuggestion(null)}
                          disabled={isApplyingMemorySuggestion}
                          className={`h-8 rounded-md border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${themeClass.ghost}`}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {aiError && !isChatCollapsed && (
          <div className="mx-3 mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {aiError}
          </div>
        )}

        <div className={`border-t p-3 ${themeClass.border} ${isChatCollapsed ? "hidden" : ""}`}>
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
            isSidePanelOpen && !isChatCollapsed ? "translate-x-0" : "-translate-x-full"
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

        <div
          className={`absolute inset-0 z-30 flex flex-col transition-transform duration-200 ${isDark ? "bg-[#17191d]" : "bg-white"} ${
            isMemoryPanelOpen && !isChatCollapsed ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className={`flex items-center justify-between border-b px-4 py-4 ${themeClass.border}`}>
            <div>
              <h2 className="text-base font-semibold">Project Memory</h2>
              <p className={`text-sm ${themeClass.muted}`}>Saved context for AI and teammates</p>
            </div>
            <button
              onClick={() => setIsMemoryPanelOpen(false)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${themeClass.muted} ${isDark ? "hover:bg-zinc-800 hover:text-zinc-50" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
            >
              <i className="ri-close-line text-xl" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <label className="block">
              <span className="text-sm font-semibold">Project goal</span>
              <textarea
                value={memoryDraft.goal}
                onChange={(e) => updateMemoryDraftField("goal", e.target.value)}
                rows={3}
                className={`mt-2 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition ${themeClass.input}`}
                placeholder="What is this project trying to become?"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Stack</span>
              <textarea
                value={memoryDraft.stack}
                onChange={(e) => updateMemoryDraftField("stack", e.target.value)}
                rows={2}
                className={`mt-2 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition ${themeClass.input}`}
                placeholder="React, Express, MongoDB, Render, Vercel..."
              />
            </label>

            {memoryListFields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-sm font-semibold">{field.label}</span>
                <textarea
                  value={memoryDraft[field.key]}
                  onChange={(e) => updateMemoryDraftField(field.key, e.target.value)}
                  rows={4}
                  className={`mt-2 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition ${themeClass.input}`}
                  placeholder="One note per line"
                />
              </label>
            ))}

            {memoryStatus && (
              <div
                className={`rounded-md border px-3 py-2 text-sm ${
                  memoryStatus.toLowerCase().includes("could not")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : isDark
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {memoryStatus}
              </div>
            )}
          </div>

          <footer className={`flex gap-2 border-t p-4 ${themeClass.border}`}>
            <button
              type="button"
              onClick={generateProjectMemory}
              disabled={isGeneratingMemory || isSavingMemory}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${themeClass.ghost}`}
            >
              <i className={isGeneratingMemory ? "ri-loader-4-line animate-spin" : "ri-sparkling-2-line"} />
              AI Refresh
            </button>
            <button
              type="button"
              onClick={saveProjectMemory}
              disabled={isSavingMemory || isGeneratingMemory}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${themeClass.primary}`}
            >
              <i className={isSavingMemory ? "ri-loader-4-line animate-spin" : "ri-save-3-line"} />
              Save
            </button>
          </footer>
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
            <button
              onClick={() => navigate("/")}
              className={`hidden h-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition md:inline-flex ${themeClass.ghost}`}
              title="Back to projects"
            >
              <i className="ri-arrow-left-line" />
            </button>
            <div className={`hidden items-center rounded-md border p-1 md:flex ${themeClass.ghost}`}>
              {[
                { id: "code", label: "Code", icon: "ri-code-s-slash-line" },
                { id: "split", label: "Split", icon: "ri-layout-column-line" },
                { id: "whiteboard", label: "Whiteboard", icon: "ri-layout-masonry-line" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveWorkspace(item.id)}
                  className={`inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition ${
                    activeWorkspace === item.id
                      ? isDark
                        ? "bg-zinc-50 text-zinc-950"
                        : "bg-zinc-950 text-white"
                      : isDark
                        ? "text-zinc-300 hover:bg-zinc-800"
                        : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <i className={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <button
              onClick={handleRunProject}
              disabled={activeWorkspace === "whiteboard" || isRunning || !fileNames.length}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className={isRunning ? "ri-loader-4-line animate-spin" : "ri-play-fill"} />
              {isRunning ? "Running" : "Run"}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {activeWorkspace !== "whiteboard" && <aside className={`hidden h-full w-60 shrink-0 border-r md:block ${themeClass.surfaceAlt}`}>
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
          </aside>}

          {activeWorkspace !== "whiteboard" && (
          <section className={`flex min-w-0 flex-col ${activeWorkspace === "split" ? "basis-1/2 border-r" : "flex-1"} ${isDark ? "bg-[#17191d]" : "bg-white"} ${themeClass.border}`}>
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
              {currentFile && currentFileData ? (
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
                        currentFileData.contents || ""
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
          )}

          {activeWorkspace === "split" && (
            <section className="relative min-w-0 basis-1/2 overflow-hidden bg-[#121212]">
              <Whiteboard
                projectId={project._id}
                socket={projectSocket}
              />
            </section>
          )}

          {activeWorkspace === "whiteboard" && (
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#121212]">
              <div className={`flex h-11 shrink-0 items-center justify-center border-b px-3 ${themeClass.surfaceAlt} ${themeClass.border}`}>
                <div className={`flex items-center rounded-md border p-1 ${themeClass.ghost}`}>
                  {[
                    { id: "document", label: "Document", icon: "ri-file-text-line" },
                    { id: "both", label: "Both", icon: "ri-layout-column-line" },
                    { id: "canvas", label: "Canvas", icon: "ri-layout-masonry-line" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWhiteboardMode(item.id)}
                      className={`inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition ${
                        whiteboardMode === item.id
                          ? isDark
                            ? "bg-zinc-50 text-zinc-950"
                            : "bg-zinc-950 text-white"
                          : isDark
                            ? "text-zinc-300 hover:bg-zinc-800"
                            : "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <i className={item.icon} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-1">
                {(whiteboardMode === "document" || whiteboardMode === "both") && (
                  <section className={`flex min-w-0 flex-col ${whiteboardMode === "both" ? "basis-1/2 border-r" : "flex-1"} ${isDark ? "bg-[#151515]" : "bg-white"} ${themeClass.border}`}>
                    <div className={`flex h-11 shrink-0 items-center justify-between border-b px-4 ${themeClass.surfaceAlt}`}>
                      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${themeClass.muted}`}>
                        Document
                      </p>
                      <span className={`text-xs ${themeClass.muted}`}>
                        {fileNames.length} project files
                      </span>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-8 py-12">
                        <input
                          value={project.name || ""}
                          readOnly
                          className={`w-full bg-transparent text-4xl font-semibold tracking-tight outline-none ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                          aria-label="Document title"
                        />
                        <textarea
                          value={documentContent}
                          onChange={(e) => setDocumentContent(e.target.value)}
                          className={`mt-6 min-h-[420px] w-full resize-none bg-transparent text-base leading-7 outline-none ${
                            isDark ? "text-zinc-200 placeholder:text-zinc-500" : "text-zinc-800 placeholder:text-zinc-400"
                          }`}
                          placeholder="Type your notes or document here - style with markdown or shortcuts (Ctrl/)"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {(whiteboardMode === "canvas" || whiteboardMode === "both") && (
                  <section className={`relative min-w-0 overflow-hidden bg-[#121212] ${whiteboardMode === "both" ? "basis-1/2" : "flex-1"}`}>
                    <Whiteboard
                      projectId={project._id}
                      socket={projectSocket}
                    />
                  </section>
                )}
              </div>
            </section>
          )}

          {activeWorkspace === "code" && iframeUrl && webContainer && (
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
