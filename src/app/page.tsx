"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SECTION_DEFS } from "@/lib/workflow/markers";
import { CRON_PRESETS } from "@/lib/workflow/generator";

export default function Home() {
  const { resolvedTheme: theme } = useTheme();
  const [tab, setTab] = useState<"preview" | "workflow">("preview");
  const [selectedSections, setSelectedSections] = useState<string[]>(["stats", "streak", "top-lang"]);
  const [baseUrl, setBaseUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const [readmeFile, setReadmeFile] = useState("README.md");
  const [schedule, setSchedule] = useState<string>("0 * * * *");

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation tabs */}
      <div className="flex justify-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-8">
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
            tab === "preview"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          🃏 Cards Preview
        </button>
        <button
          onClick={() => setTab("workflow")}
          className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
            tab === "workflow"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          🤖 Workflow Setup
        </button>
      </div>

      {tab === "preview" ? (
        <div>
          <h1 className="text-4xl font-extrabold text-center text-neutral-900 dark:text-white mb-8">
            Cards Preview
          </h1>
          {/* Cards */}
          <div className="flex flex-wrap justify-center gap-5 *:max-w-md">
            {[
              { src: "/stats", w: 440, h: 210, alt: "GitHub Stats" },
              { src: "/streak", w: 440, h: 210, alt: "GitHub Streak" },
              { src: "/top-lang", w: 300, h: 160, alt: "Top Languages" },
              { src: "/achievements", w: 380, h: 230, alt: "GitHub Achievements" },
            ].map(({ src, w, h, alt }) => (
              <Image
                key={src}
                src={`${src}${theme === "dark" ? `?theme=github_dark` : ""}`}
                unoptimized
                alt={alt}
                width={w}
                height={h}
                className="w-full rounded-xl shadow-lg"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
            📋 Select Card Sections
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Choose which stats cards you want to automatically update in your README.
          </p>

          <div className="flex flex-col gap-3">
            {Object.entries(SECTION_DEFS).map(([id, def]) => {
              const isSelected = selectedSections.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedSections((prev) =>
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id]
                    );
                  }}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? "border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-950/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                      isSelected
                        ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 stroke-[3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {def.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Configuration Fields */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                🔗 Vercel Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-cards.vercel.app"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white text-sm outline-none transition focus:border-neutral-900 dark:focus:border-white"
              />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 leading-relaxed">
                The deployed URL of your github-readme-cards application.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                📄 README Filename
              </label>
              <input
                type="text"
                value={readmeFile}
                onChange={(e) => setReadmeFile(e.target.value)}
                placeholder="README.md"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white text-sm outline-none transition focus:border-neutral-900 dark:focus:border-white"
              />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 leading-relaxed">
                The name of the markdown file in your repository where cards will be injected.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                ⏰ Update Schedule
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white text-sm outline-none transition focus:border-neutral-900 dark:focus:border-white cursor-pointer"
              >
                {CRON_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value} className="bg-white dark:bg-neutral-900">
                    {preset.label} ({preset.value})
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 leading-relaxed">
                How often GitHub Actions will run to fetch new stats.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
