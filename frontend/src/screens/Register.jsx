import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import UserContext from "../context/user.context";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();

    axios
      .post("/users/register", { 
        email,
        password
       })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response?.data);
      });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Badge/Logo */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/40 via-purple-400/30 to-cyan-400/30 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl backdrop-blur">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  className="text-indigo-400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3l2.6 5.27L20.5 9l-4.25 4.14L17.2 19 12 15.9 6.8 19l.95-5.86L3.5 9l5.9-.73L12 3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card with gradient border glow */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/40 via-purple-500/25 to-cyan-500/25 blur-xl"
            />
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 text-center">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Register
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-400">
                  Welcome. Please enter your details.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submitHandler} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm text-slate-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 7l9 6 9-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-0 w-full rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-3 sm:py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="5"
                          y="11"
                          width="14"
                          height="9"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 11V8a4 4 0 0 1 8 0v3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-0 w-full rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-3 sm:py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 transition-all px-4 py-3 sm:py-2.5 text-base sm:text-sm font-medium shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_30px_0_rgba(99,102,241,0.35)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Register
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-sm sm:text-base">
                <p className="text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Protected by modern security best practices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
