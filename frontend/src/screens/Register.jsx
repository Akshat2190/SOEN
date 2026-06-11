import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import UserContext from "../context/user.context";

/* ─── tiny inline styles that Tailwind v4 arbitrary values can't express cleanly ─── */
const styles = `
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 0.85; transform: scale(1.04); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
    20%, 24%, 55% { opacity: 0.4; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-14px) rotate(1deg); }
  }
  .soen-logo { font-family: 'Bebas Neue', sans-serif; }
  .mono-input { font-family: 'DM Mono', monospace; }
  .body-text  { font-family: 'Outfit', sans-serif; }
  .monitor-float { animation: float 6s ease-in-out infinite; }
  .logo-flicker  { animation: flicker 8s step-start infinite; }
  .glow-pulse    { animation: pulse-glow 4s ease-in-out infinite; }
  .scanline-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(231,76,60,0.6), transparent);
    animation: scanline 4s linear infinite;
    pointer-events: none;
  }
  /* Custom checkbox accent */
  .checkbox-red { accent-color: #e74c3c; }
  /* Input focus glow */
  .input-dark:focus {
    outline: none;
    border-color: #e74c3c;
    box-shadow: 0 0 0 2px rgba(231,76,60,0.25), inset 0 0 0 1px rgba(231,76,60,0.15);
  }
  /* Social pill hover */
  .social-pill {
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .social-pill:hover {
    background: rgba(231,76,60,0.12);
    border-color: rgba(231,76,60,0.6);
    transform: translateY(-1px);
  }
  /* CTA button */
  .cta-btn {
    transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s;
  }
  .cta-btn:hover {
    background: #e74c3c;
    color: #ffffff;
    box-shadow: 0 6px 28px rgba(231,76,60,0.45);
    transform: translateY(-1px);
  }
  .cta-btn:active { transform: translateY(0); }
  /* Right panel noise texture overlay */
  .noise-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }
`;

/* ─── Retro Monitor SVG focal point ─── */
const RetroMonitor = () => (
  <div className="monitor-float relative flex flex-col items-center select-none">
    {/* Glow halo */}
    <div
      className="glow-pulse absolute inset-0 rounded-[40px] blur-3xl"
      style={{ background: "radial-gradient(ellipse, rgba(231,76,60,0.35) 0%, transparent 70%)" }}
    />

    <svg
      width="260"
      height="230"
      viewBox="0 0 260 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 drop-shadow-2xl"
    >
      {/* Monitor body */}
      <rect x="10" y="10" width="240" height="170" rx="14" fill="#1c1c1c" stroke="#333" strokeWidth="2" />
      {/* Screen bezel */}
      <rect x="20" y="20" width="220" height="150" rx="8" fill="#0d0d0d" />
      {/* Screen glow inner */}
      <rect x="22" y="22" width="216" height="146" rx="7"
        fill="url(#screenGrad)" opacity="0.9" />
      {/* Scanline on screen */}
      <rect x="22" y="22" width="216" height="146" rx="7"
        fill="url(#scanGrad)" opacity="0.12" />
      {/* SOEN text on screen */}
      <text x="130" y="106" textAnchor="middle" dominantBaseline="middle"
        fontFamily="'Bebas Neue', sans-serif" fontSize="52" fill="#e74c3c"
        className="logo-flicker" letterSpacing="6">SOEN</text>
      {/* Cursor blink */}
      <rect x="166" y="112" width="3" height="18" rx="1" fill="#e74c3c" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0;0.9" dur="1.1s" repeatCount="indefinite" />
      </rect>
      {/* Stand neck */}
      <rect x="114" y="180" width="32" height="20" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
      {/* Stand base */}
      <rect x="86" y="198" width="88" height="12" rx="5" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
      {/* Power button */}
      <circle cx="130" cy="188" r="3.5" fill="#e74c3c" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Vents */}
      <line x1="204" y1="155" x2="220" y2="155" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="204" y1="161" x2="220" y2="161" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="204" y1="167" x2="220" y2="167" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" />

      <defs>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0505" />
          <stop offset="50%" stopColor="#0d0d0d" />
          <stop offset="100%" stopColor="#0a0000" />
        </linearGradient>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e74c3c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>

    {/* Tag line */}
    <p
      className="relative z-10 mt-4 text-xs tracking-[0.3em] uppercase"
      style={{ color: "rgba(231,76,60,0.55)", fontFamily: "'DM Mono', monospace" }}
    >
      Code. Collaborate. Ship.
    </p>
  </div>
);

/* ─── Divider component ─── */
const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px" style={{ background: "#2e2e2e" }} />
    <span className="text-xs" style={{ color: "#555", fontFamily: "'Outfit', sans-serif" }}>
      {label}
    </span>
    <div className="flex-1 h-px" style={{ background: "#2e2e2e" }} />
  </div>
);

/* ─── Social icons (inline SVG, no deps) ─── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.29.07 2.18.82 2.93.82.75 0 2.15-.99 3.62-.85 1.52.15 2.67.82 3.38 2.07-3.12 1.89-2.61 5.97.56 7.34-.67 1.64-1.54 3.25-2.49 4.5zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const Register = () => {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed]   = useState(false);

  /* ─── tiny style objects ────────────────────────────────────────── */
  const dmSans = { fontFamily: "'DM Sans', sans-serif" };

  const { setUser } = useContext(UserContext);
  const navigate    = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    console.log({ email, password, agreed });

    axios
      .post("/users/register", { email, password })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/home");
      })
      .catch((err) => {
        console.log(err.response?.data);
      });
  }

  return (
    <>
      {/* Inject keyframe / font styles */}
      <style>{styles}</style>

      <div
        className="flex min-h-screen w-full overflow-hidden"
        style={{ background: "#111111" }}
      >
        {/* ══════ LEFT PANEL — form ══════ */}
        <div
          className="relative flex flex-col justify-center w-full md:w-[42%] lg:w-[38%] min-h-screen px-8 sm:px-12 py-10 body-text z-10"
          style={{
            background: "linear-gradient(160deg, #1e1e1e 0%, #161616 60%, #131313 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Subtle left-edge red glow */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1"
            style={{ background: "linear-gradient(180deg, transparent, #e74c3c55, transparent)" }}
          />
          {/* Top-right corner gradient */}
          <div
            className="pointer-events-none absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(231,76,60,0.08) 0%, transparent 70%)" }}
          />

          {/* ── Logo ── */}
          <div className="mb-8 flex items-center gap-1.5">
            <span
              className="soen-logo text-4xl tracking-wider leading-none"
              style={{ color: "#e74c3c" }}
            >
              SOEN
            </span>
            {/* trademark dot accent */}
            <span
              className="mt-1 h-1.5 w-1.5 rounded-full self-start"
              style={{ background: "#e74c3c", boxShadow: "0 0 6px #e74c3c" }}
            />
          </div>

          {/* ── Heading ── */}
          <h1
            className="text-[28px] font-semibold leading-tight mb-1"
            style={{ color: "#ffffff" }}
          >
            Sign up
          </h1>
          <p className="mb-7 text-[13px]" style={{ color: "#888888" }}>
            Create your SOEN account and collaborate in real-time.
          </p>

          {/* ── Form ── */}
          <form onSubmit={submitHandler} className="flex flex-col gap-3.5">

            {/* Email */}
            <input
              id="soen-register-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-dark mono-input w-full rounded-md px-4 py-3 text-[13px] transition-all"
              style={{
                background: "#2a2a2a",
                border: "1px solid #333333",
                color: "#ffffff",
              }}
            />

            {/* Password */}
            <input
              id="soen-register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-dark mono-input w-full rounded-md px-4 py-3 text-[13px] transition-all"
              style={{
                background: "#2a2a2a",
                border: "1px solid #333333",
                color: "#ffffff",
              }}
            />

            {/* Checkbox */}
            <label
              className="flex items-center gap-2.5 cursor-pointer select-none"
              htmlFor="soen-terms"
            >
              <input
                id="soen-terms"
                type="checkbox"
                className="checkbox-red h-3.5 w-3.5 rounded-sm cursor-pointer"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-[12px] leading-snug" style={{ color: "#888888" }}>
                I Agree To The{" "}
                <span
                  className="underline cursor-pointer hover:text-white transition-colors"
                  style={{ color: "#aaaaaa" }}
                >
                  Terms &amp; Privacy Policy
                </span>
              </span>
            </label>

            {/* CTA button */}
            <button
              id="soen-create-account-btn"
              type="submit"
              disabled={!agreed}
              className="cta-btn w-full rounded-md py-3 text-[14px] font-bold tracking-wide mt-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: "#ffffff",
                color: "#111111",
              }}
            >
              Create Account
            </button>
          </form>

          {/* ── Divider ── */}
          <Divider label="or sign up via" />

          {/* ── Social pills ──
          <div className="flex gap-2.5">
            {[
              { id: "soen-social-google", label: "Google", icon: <GoogleIcon /> },
              { id: "soen-social-apple",  label: "Apple",  icon: <AppleIcon />  },
              { id: "soen-social-twitter",label: "Twitter",icon: <XIcon />      },
            ].map(({ id, label, icon }) => (
              <button
                key={label}
                id={id}
                type="button"
                onClick={() => console.log(`${label} OAuth`)}
                className="social-pill flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-medium"
                style={{
                  background: "transparent",
                  border: "1px solid #333333",
                  color: "#ffffff",
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div> */}

          {/* ── Footer ── */}
          <p
            className="mt-7 text-center text-[13px]"
            style={{ color: "#666666" }}
          >
            Already Have An Account?{" "}
            <Link
              to="/login"
              className="font-medium underline-offset-2 hover:underline transition-colors"
              style={{ color: "#e74c3c" }}
            >
              Login
            </Link>
          </p>
          {/* Back button */}
          <button
              id="login-back-btn"
              onClick={() => navigate("/")}
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
        </div>

        {/* ══════ RIGHT PANEL — atmospheric visual ══════ */}
        <div
          className="relative hidden md:flex flex-1 items-center justify-center overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 70%, #8B0000 0%, #c0392b 20%, #6b1010 45%, #1a0a0a 75%, #0d0505 100%)
            `,
          }}
        >
          {/* Noise texture */}
          <div className="noise-overlay absolute inset-0 pointer-events-none" />

          {/* Atmospheric depth layers */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 120% 40% at 50% 100%, rgba(180,30,10,0.55) 0%, transparent 60%),
                radial-gradient(ellipse 60% 30% at 20% 80%, rgba(100,0,0,0.4) 0%, transparent 60%),
                radial-gradient(ellipse 60% 30% at 80% 75%, rgba(140,10,10,0.35) 0%, transparent 60%),
                linear-gradient(to top, rgba(10,0,0,0.85) 0%, transparent 40%)
              `,
            }}
          />

          {/* Horizon glow strip */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "30%",
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(231,76,60,0.5), rgba(200,57,43,0.8), rgba(231,76,60,0.5), transparent)",
              filter: "blur(2px)",
            }}
          />

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
            }}
          />

          {/* Moving scan bar */}
          <div className="scanline-bar" />

          {/* Retro monitor focal point */}
          <div className="relative z-10">
            <RetroMonitor />
          </div>

          {/* Bottom atmospheric fog */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(5,0,0,0.9) 0%, transparent 100%)",
            }}
          />

          {/* Top dark fade */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(5,0,0,0.7) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Register;
