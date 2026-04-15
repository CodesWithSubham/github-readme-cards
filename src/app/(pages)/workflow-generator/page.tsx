"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SECTION_DEFS } from "@/lib/workflow/markers";
import { CRON_PRESETS } from "@/lib/workflow/generator";

export default function WorkflowGeneratorPage() {
  const { resolvedTheme: theme } = useTheme();
  const [selectedSections, setSelectedSections] = useState<string[]>(["stats", "streak", "top-lang"]);
  const [baseUrl, setBaseUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const [readmeFile, setReadmeFile] = useState("README.md");
  const [schedule, setSchedule] = useState<string>("0 * * * *");
  const [copied, setCopied] = useState(false);
  const [yamlPreview, setYamlPreview] = useState("");

  useEffect(() => {
    let active = true;
    if (selectedSections.length === 0) {
      Promise.resolve().then(() => {
        if (active) setYamlPreview("");
      });
      return;
    }
    const params = new URLSearchParams({
      sections: selectedSections.join(","),
      schedule,
      base_url: baseUrl || "https://your-cards.vercel.app",
      theme: theme === "dark" ? "github_dark" : "default",
      readme: readmeFile || "README.md",
    });

    fetch(`/api/workflow-gen?${params.toString()}`)
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("Failed to fetch workflow");
      })
      .then((yaml) => {
        if (active) setYamlPreview(yaml);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      active = false;
    };
  }, [selectedSections, schedule, baseUrl, readmeFile, theme]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          🤖 Workflow Generator
        </h1>
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left panel: Config card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
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

        {/* Right panel: Live YAML preview */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              📄 update-readme-cards.yml
            </label>
            {yamlPreview && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(yamlPreview);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      sections: selectedSections.join(","),
                      schedule,
                      base_url: baseUrl || "https://your-cards.vercel.app",
                      theme: theme === "dark" ? "github_dark" : "default",
                      readme: readmeFile || "README.md",
                    });
                    window.location.href = `/api/workflow-gen?${params.toString()}`;
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 transition flex items-center gap-1.5"
                >
                  ⬇️ Download
                </button>
              </div>
            )}
          </div>
          {yamlPreview ? (
            <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden p-4">
              <pre
                style={{
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontVariantLigatures: "none",
                }}
                className="text-[11.5px] text-neutral-800 dark:text-neutral-200 overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre scrollbar-thin"
              >
                {yamlPreview}
              </pre>
            </div>
          ) : (
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
              <p className="text-sm">Select at least one section on the left to generate the YAML workflow.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
