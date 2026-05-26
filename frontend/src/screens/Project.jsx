/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from "markdown-to-jsx";
import { getWebContainer } from "../config/webContainer.js";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && window.hljs) {
      window.hljs.highlightElement(ref.current);
    }
  }, [props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Add this line
  const messageBox = React.createRef();
  const codeRef = useRef(null);
  const runProcessRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [aiError, setAiError] = useState(null);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null)
  const didLoadProjectRef = useRef(false);

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container);
        console.log("container started")
      }).catch(error => {
        console.error("Failed to initialize WebContainer:", error);
      })
    }

    receiveMessage("project-message", (data) => {
      try {
        const message = JSON.parse(data.message);

        webContainer?.mount(message.fileTree); 

        if (message.fileTree) {
          // Transform the AI fileTree structure
          const transformedFileTree = {};
          Object.keys(message.fileTree).forEach((filename) => {
            transformedFileTree[filename] = message.fileTree[filename];
          });
          setFileTree(transformedFileTree);
          setAiError(null); // Clear any previous errors
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        setAiError("Failed to process AI response");
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        const fetchedProject = res.data.project;
        setProject(fetchedProject);
        setFileTree(fetchedProject?.fileTree || {});
        didLoadProjectRef.current = true;

        const fileNames = Object.keys(fetchedProject?.fileTree || {});
        setOpenFiles(fileNames);
        if (!currentFile && fileNames.length) {
          setCurrentFile(fileNames[0]);
        }
      })
      .catch((error) => {
        console.error("Failed to load project:", error);
      });
    if (window.hljs) {
      window.hljs.configure({ ignoreUnescapedHTML: true });
    }
  }, [location.state.project._id, project._id]);

  // Add auto-scroll effect
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (!didLoadProjectRef.current) return;
    if (!currentFile || !fileTree[currentFile]) return;

    const timeoutId = setTimeout(() => {
      saveFileTree(fileTree);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fileTree, currentFile]);

  function saveFileTree(ft) {
    if (!didLoadProjectRef.current) return;

    axios.put("/projects/update-file-tree", {
      projectId: project._id,
      fileTree: ft
    }).then(res => {
      console.log("File tree updated successfully", res.data);
    }).catch(err => {
      console.error("Failed to update file tree:", err);
    })
  }

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    const projectId = location?.state?.project?._id;
    if (!projectId) return console.warn("No project id");
    axios
      .put("/projects/add-user", {
        projectId,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch(console.error);
  }

  const send = () => {
    if (!message.trim()) return;

    const messageData = {
      message,
      sender: user,
    };

    sendMessage("project-message", messageData);
    appendOutGoingMessage(messageData);
    setMessage("");
  };

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  function appendIncomingMessage(messageObject) {
    setMessages((prev) => [...prev, { ...messageObject, isOutgoing: false }]);
  }

  function appendOutGoingMessage(messageObject) {
    setMessages((prev) => [...prev, { ...messageObject, isOutgoing: true }]);
  }

  function writeAiMessage(message) {
    const messageObject = JSON.parse(message);
    console.log(message)

    return (
      <div className="text-sm overflow-auto bg-slate-950 text-white rounded-sm break-words p-2">
        <Markdown
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        >
          {messageObject.text}
        </Markdown>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen min-w-80 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-50 absolute top-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 items-center hover:bg-slate-200 rounded-md px-2 py-1"
          >
            <i className="ri-add-fill mr-1 text-xl"></i>
            <p className="text-xs">Add Collaborator</p>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col overflow-hidden pt-16">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-y-auto scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message max-w-60 break-words flex flex-col p-2 bg-slate-50 w-fit rounded-md ${
                  msg.sender._id === user._id ? "ml-auto" : ""
                }`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                {msg.sender._id === "ai" ? (
                  writeAiMessage(msg.message)
                ) : (
                  <p className="text-sm break-words">{msg.message}</p>
                )}
              </div>
            ))}
          </div>
          <div className="inputField w-full flex bg-amber-50">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 w-full border-none outline-none bg-amber-50"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 transition-all absolute ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center h-[6vw] px-3 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer flex hover:bg-slate-200 p-2 gap-2 items-center"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-slate-600">
                      <i className="ri-user-fill" />
                    </div>

                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right bg-red-50 flex-grow h-full flex">

        <div className="explorer h-full min-w-52 max-w-64 bg-slate-400">
          <div className="file-tree w-full">
            {
              Object.keys(fileTree).map((file) => (
                <button 
                 key={file}
                 onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles([ ...new Set([ ...openFiles, file ])]) 
                 }} 
                 className="tree-element cursor-pointer w-full p-2 px-4 flex items-center gap-2 bg-slate-200 ">
                  <p className="font-semibold text-lg">{file}</p>
                </button>
              ))
            }
          </div>
        </div>
        
          <div className="code-editor flex flex-col flex-grow h-full">

              <div className="top flex justify-between w-full">

                <div className="files flex">
                  {
                    openFiles.map((file) => (
                      <button 
                        key={file}
                        onClick={() => setCurrentFile(file)} 
                        className={`tab-element cursor-pointer p-2 px-4 border-b-2 ${currentFile === file ? 'border-blue-600 bg-slate-300' : 'border-transparent hover:bg-slate-200' }`}
                      >
                        <p className="font-semibold text-lg">{file}</p>
                      </button>
                    ))
                  }
                </div>

                <div className="actions flex gap-2">
                  <button
                    onClick={async () => {
                      if (!webContainer) {
                        console.error("WebContainer is not ready yet");
                        return;
                      }

                      const filePaths = Object.keys(fileTree || {});
                      if (!filePaths.length) {
                        console.error("No files available to run");
                        return;
                      }

                      if (runProcessRef.current) {
                        try {
                          runProcessRef.current.kill();
                        } catch (e) {
                          console.warn("Failed to stop previous run process", e);
                        }
                        runProcessRef.current = null;
                      }

                      await webContainer.mount(fileTree);

                      const packageJsonPath = filePaths.find((path) => path.endsWith("package.json"));
                      if (!packageJsonPath) {
                        console.error("No package.json found in generated files");
                        return;
                      }

                      const workingDirectory =
                        packageJsonPath.includes("/")
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

                      installProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        }
                      }));

                      const installExitCode = await installProcess.exit;
                      if (installExitCode !== 0) {
                        console.error("npm install failed", installExitCode);
                        return;
                      }

                      // Attempt to kill any previous server running on common dev port before starting
                      try {
                        // Use --yes to auto-accept installing kill-port if npx prompts
                        const killProcess = await webContainer.spawn("npx", ["--yes", "kill-port", "3000"], {
                          cwd: workingDirectory,
                        });

                        killProcess.output.pipeTo(new WritableStream({
                          write(chunk) {
                            console.log(chunk);
                          }
                        }));

                        // wait for kill to finish but ignore non-zero exit
                        try { await killProcess.exit; } catch (e) { console.warn('kill-port failed', e); }
                      } catch (e) {
                        console.warn('Failed to spawn kill command', e);
                      }

                      const runProcess = await webContainer.spawn("npm", runArgs, {
                        cwd: workingDirectory,
                      });

                      runProcessRef.current = runProcess;

                      runProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        }
                      }));

                      runProcess.exit.finally(() => {
                        if (runProcessRef.current === runProcess) {
                          runProcessRef.current = null;
                        }
                      });

                      webContainer.on("server-ready", (port, url)=>{
                        console.log(port, url);
                        setIframeUrl(url);
                      })
                    }}
                    className="px-5 bg-slate-300 text-white"
                    >run</button>

                </div>
              </div>
              <div className="bottom h-full">
                {fileTree[currentFile] && (
                  <pre className="h-full w-full overflow-auto bg-slate-100 p-4">
                    <code
                      ref={codeRef}
                      className="hljs h-full outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            ...fileTree[currentFile],
                            file: {
                              ...fileTree[currentFile].file,
                              contents: updatedContent,
                            },
                          },
                        };

                        setFileTree(ft);
                      }}
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            ...fileTree[currentFile],
                            file: {
                              ...fileTree[currentFile].file,
                              contents: updatedContent,
                            },
                          },
                        };

                        setFileTree(ft);

                        try {
                          if (window && window.hljs) {
                            const language = currentFile?.endsWith(".js")
                              ? "javascript"
                              : currentFile?.endsWith(".jsx")
                                ? "javascript"
                                : currentFile?.endsWith(".css")
                                  ? "css"
                                  : currentFile?.endsWith(".html")
                                    ? "html"
                                    : "plaintext";

                            e.target.innerHTML = window.hljs.highlight(updatedContent, { language }).value;
                          }
                        } catch (err) {
                          console.error("hljs highlight failed", err);
                        }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const contents = fileTree[currentFile].file.contents || "";

                          try {
                            if (window && window.hljs) {
                              const language = currentFile?.endsWith(".js")
                                ? "javascript"
                                : currentFile?.endsWith(".jsx")
                                  ? "javascript"
                                  : currentFile?.endsWith(".css")
                                    ? "css"
                                    : currentFile?.endsWith(".html")
                                      ? "html"
                                      : "plaintext";

                              return window.hljs.highlight(contents, { language }).value;
                            }
                          } catch (err) {
                            console.error("hljs highlight failed", err);
                          }

                          return contents;
                        })(),
                      }}
                      style={{
                        whiteSpace: "pre-wrap",
                        paddingBottom: "25rem",
                        counterSet: "line-number",
                      }}
                    />
                  </pre>
                )}
              </div>
          </div>

          {iframeUrl && webContainer && 
            (<div className="flex flex-col min-w-96 h-full">
              <div className="address-bar">
                <input type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
              </div>
              <iframe src={iframeUrl} className="w-full h-full"></iframe>
            </div>)
          }
        
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    selectedUserId.has(user._id) ? "bg-slate-200" : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-slate-600">
                    <i className="ri-user-fill"></i>
                  </div>
                  <h1 className="font-semibold text-sm truncate">
                    {user.email}
                  </h1>
                  {selectedUserId.has(user._id) && (
                    <i className="ri-check-line ml-auto" />
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No users
                </p>
              )}
            </div>
            <button
              disabled={!selectedUserId.size}
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
