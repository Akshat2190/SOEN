import React from "react";
import { useTheme } from "../context/theme.context.jsx";

const LoadingExperience = () => {
  const { isDark } = useTheme();

  return (
    <main
      className={`min-h-screen overflow-hidden ${
        isDark ? "bg-[#090b0f] text-white" : "bg-[#f4f1ec] text-[#090b0f]"
      }`}
    >
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_34rem)]"
              : "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),transparent_34rem)]"
          }`}
        />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <div className="relative h-56 w-56 sm:h-72 sm:w-72">
            <div
              className={`absolute inset-0 rounded-full border ${
                isDark ? "border-white/10" : "border-black/10"
              }`}
            />
            <div
              className={`absolute inset-6 animate-spin rounded-full border border-transparent ${
                isDark ? "border-t-white/80" : "border-t-black/80"
              }`}
            />
            <div
              className={`absolute inset-14 rounded-full border ${
                isDark ? "border-white/15 bg-white/5" : "border-black/10 bg-white/60"
              } backdrop-blur-xl`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`grid h-20 w-20 place-items-center rounded-2xl text-xl font-bold ${
                  isDark ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                SO
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.34em] ${
                isDark ? "text-white/50" : "text-black/50"
              }`}
            >
              Waking Workspace
            </p>
            <h1 className="text-3xl font-semibold sm:text-5xl">SOEN is getting ready</h1>
            <p className={`max-w-md text-sm ${isDark ? "text-white/55" : "text-black/55"}`}>
              Syncing your session, projects, memory, and realtime room.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoadingExperience;
