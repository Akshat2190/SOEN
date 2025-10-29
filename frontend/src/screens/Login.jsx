import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();

    axios
      .post("/users/login", { email, password })
      .then((res) => {
        console.log(res.data);

        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);

        navigate("/");
      })
      .catch((err) => {
        console.log(err.response.data);
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
                  Welcome back
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-400">
                  Sign in to continue
                </p>
              </div>

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-0 w-full rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-10 py-3 sm:py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 inline-flex items-center rounded-md p-2 text-slate-400 hover:text-slate-200"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3 3l18 18"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M9.88 5.09A10.92 10.92 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-3.17 4.5M6.18 6.18A13.2 13.2 0 0 0 2 12s3 7 10 7c1.33 0 2.58-.24 3.73-.68"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 py-3 sm:py-2.5 text-base sm:text-sm font-medium shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_30px_0_rgba(99,102,241,0.35)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-sm sm:text-base">
                <Link
                  to="/forgot-password"
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Forgot password?
                </Link>
                <p className="text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                  >
                    Create one
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

export default Login;
