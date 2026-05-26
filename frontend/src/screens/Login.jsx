import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

/* ─── constants ────────────────────────────────────────────────── */
const PAINTING_SRC = "/painting.png";

/* ─── tiny style objects ────────────────────────────────────────── */
const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const playfair = { fontFamily: "'Playfair Display', serif" };

const inputStyle = {
  background: "#f0eeeb",
  border: "none",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "14px",
  color: "#333",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  ...dmSans,
};

/* ─── component ─────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  /* keep the real login logic intact */
  function submitHandler() {
    setLoading(true);
    axios
      .post("/users/login", { email, password })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err?.response?.data);
        setLoading(false);
      });
  }

  return (
    <>
      {/* ── Global page: painting fills the full viewport ── */}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background painting — no overlay */}
        <img
          src={PAINTING_SRC}
          alt="Impressionist background"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />

        {/* ── Floating card ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "#ffffff",
            borderRadius: "20px",
            width: "min(680px, 95vw)",
            minHeight: "420px",
            display: "flex",
            overflow: "hidden",
            /* no shadow, just white + clean */
          }}
        >
          {/* ── LEFT COLUMN: cropped painting ── */}
          <div
            className="login-left-col"
            style={{
              width: "42%",
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: "20px 0 0 20px",
            }}
          >
            <img
              src={PAINTING_SRC}
              alt="Painting detail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>

          {/* ── RIGHT COLUMN: form ── */}
          <div
            style={{
              width: "58%",
              background: "#ffffff",
              padding: "40px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              ...dmSans,
            }}
          >
            {/* TOP — back link */}
            <div>
              <button
                id="login-back-btn"
                onClick={() => console.log("back")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#666",
                  padding: 0,
                  marginBottom: "24px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  ...dmSans,
                }}
              >
                ← Back
              </button>

              {/* MIDDLE — heading + inputs */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#888",
                  fontWeight: 400,
                  marginBottom: "4px",
                  marginTop: 0,
                }}
              >
                Login to
              </p>

              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                  marginTop: 0,
                  marginBottom: "28px",
                  ...playfair,
                }}
              >
                Where Knowledge
                <br />
                Comes Alive
              </h1>

              {/* Email input */}
              <input
                id="login-email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  console.log("email:", e.target.value);
                }}
                style={{ ...inputStyle, marginBottom: "10px" }}
              />

              {/* Password input */}
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  console.log("password changed");
                }}
                style={{ ...inputStyle, marginBottom: "16px" }}
              />

              {/* Login button */}
              <button
                id="login-submit-btn"
                onClick={submitHandler}
                disabled={loading}
                className="login-btn"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: loading
                    ? "#a0896a"
                    : "linear-gradient(135deg, #8b6914 0%, #6b7c3a 100%)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "14px",
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
                  boxShadow: "0 2px 8px rgba(107, 124, 58, 0.30)",
                  opacity: loading ? 0.75 : 1,
                  ...dmSans,
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="15" height="15" viewBox="0 0 24 24"
                      fill="none" className="login-spinner"
                      style={{ animation: "loginSpin 0.75s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign in →</>
                )}
              </button>

              {/* Sign-up prompt */}
              <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
                Don&apos;t have an account?{" "}
                <button
                  id="login-signup-link"
                  onClick={() => navigate("/register")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3b6ea5",
                    padding: 0,
                    textDecoration: "none",
                    ...dmSans,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* BOTTOM — logo row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "32px",
              }}
            >
              {/* Logo mark + wordmark */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Geometric logo mark: black circle with white arc */}
                <div
                  aria-hidden="true"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 13 L13 3"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Wordmark */}
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#111",
                    letterSpacing: "-0.5px",
                  }}
                >
                  SOEN
                </span>
              </div>

              {/* Right tagline */}
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#999",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  Real-time Collaboration for
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#999",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  Developers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Responsive + button animations ── */}
      <style>{`
        @media (max-width: 640px) {
          .login-left-col {
            display: none !important;
          }
          .login-left-col ~ div {
            width: 100% !important;
          }
        }
        #login-email::placeholder,
        #login-password::placeholder {
          color: #aaa;
        }
        #login-email:-webkit-autofill,
        #login-password:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #f0eeeb inset !important;
          -webkit-text-fill-color: #333 !important;
        }
        .login-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(107, 124, 58, 0.40) !important;
        }
        .login-btn:not(:disabled):active {
          transform: translateY(0px);
          box-shadow: 0 2px 6px rgba(107, 124, 58, 0.25) !important;
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Login;
