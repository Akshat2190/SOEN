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

  const [users, setUsers] = useState([]);

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      console.log(data);
      appendIncomingMessage(data);
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        setProject(res.data.project);
      });

    // fetch users (adjust endpoint)
    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users || []))
      .catch(console.error);

    // Initialize highlight.js
    if (window.hljs) {
      window.hljs.configure({ ignoreUnescapedHTML: true });
    }
  }, [location.state.project._id, project._id]);

  // Add auto-scroll effect
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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
                  msg.isOutgoing ? "ml-auto" : ""
                }`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                {msg.sender._id === "ai" ? (
                  <div className="text-sm overflow-auto bg-slate-950 text-white rounded-sm break-words p-2">
                    <Markdown
                      options={{
                        overrides: {
                          code: SyntaxHighlightedCode,
                        },
                      }}
                    >
                      {msg.message}
                    </Markdown>
                  </div>
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
