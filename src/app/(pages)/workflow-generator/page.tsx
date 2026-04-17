"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { SECTION_DEFS } from "@/lib/workflow/markers";
import { CRON_PRESETS } from "@/lib/workflow/generator";
import { supportedLocales, type Locale } from "@/lib/i18n";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ar: "Arabic",
  pt: "Portuguese",
  ko: "Korean",
  ru: "Russian",
};

const SM = (id: string) => `<!-- GRC:${id}:START -->`;
const EM = (id: string) => `<!-- GRC:${id}:END -->`;

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col">
      {title && (
        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {title}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre
          style={{
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontVariantLigatures: "none",
          }}
          className="text-[11.5px] text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre scrollbar-thin"
        >
          {code}
        </pre>
      </div>
    </div>
  );
}

export default function WorkflowGeneratorPage() {
  const [step, setStep] = useState(1);
  const [selectedSections, setSelectedSections] = useState<string[]>(["stats", "streak", "top-lang"]);
  const [baseUrl, setBaseUrl] = useState("");
  const [readmeFile, setReadmeFile] = useState("README.md");
  const [schedule, setSchedule] = useState<string>("0 * * * *");
  const [locale, setLocale] = useState("en");
  const [yaml, setYaml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      startTransition(() => setBaseUrl(window.location.origin));
    }
  }, []);

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const markers = selectedSections
    .map((id) => {
      const def = SECTION_DEFS[id];
      return def ? `${SM(id)}\n<!-- ${def.icon} ${def.label} auto-updated -->\n${EM(id)}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  const generateWorkflow = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sections: selectedSections.join(","),
        schedule,
        base_url: baseUrl || "https://your-cards.vercel.app",
        locale,
        readme: readmeFile || "README.md",
      });
      const res = await fetch(`/api/workflow-gen?${params.toString()}`);
      if (res.ok) {
        const text = await res.text();
        setYaml(text);
        setStep(3);
      } else {
        console.error("Failed to generate workflow");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dlUrl = `/api/workflow-gen?sections=${selectedSections.join(",")}&schedule=${encodeURIComponent(schedule)}&base_url=${encodeURIComponent(baseUrl)}&locale=${locale}&readme=${readmeFile}`;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
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

      {/* Step Navigation Bar */}
      <div className="flex justify-center mb-8 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        {[
          { n: 1, l: "Choose Sections" },
          { n: 2, l: "Configure" },
          { n: 3, l: "Download" },
        ].map((s) => {
          const isAccessible =
            s.n < step ||
            (s.n === 2 && selectedSections.length > 0) ||
            (s.n === 3 && yaml !== null);
          return (
            <button
              key={s.n}
              onClick={() => {
                if (isAccessible) setStep(s.n);
              }}
              disabled={!isAccessible}
              className={`flex-1 py-3 px-4 text-center text-xs sm:text-sm font-semibold border-r last:border-r-0 border-neutral-200 dark:border-neutral-800 transition ${
                step === s.n
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  : isAccessible
                  ? "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer"
                  : "text-neutral-400 dark:text-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-not-allowed"
              }`}
            >
              <span className="mr-1.5 opacity-60">{s.n}.</span>
              {s.l}
            </button>
          );
        })}
      </div>

      {/* Step 1: Choose Sections */}
      {step === 1 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1.5">
              📋 Select Card Sections
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Choose which stats cards you want to automatically update in your README.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(SECTION_DEFS).map(([id, def]) => {
              const isSelected = selectedSections.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleSection(id)}
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

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
            <button
              onClick={() => setStep(2)}
              disabled={selectedSections.length === 0}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition ${
                selectedSections.length > 0
                  ? "bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 cursor-pointer"
                  : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-600 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left panel: Form parameters */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
              ⚙️ Workflow Config
            </h2>

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
            </div>

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
            </div>

            {/* Theme selection removed as markdown formatting is theme-independent */}

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                🌍 Language
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white text-sm outline-none transition focus:border-neutral-900 dark:focus:border-white cursor-pointer"
              >
                {supportedLocales.map((code) => (
                  <option key={code} value={code} className="bg-white dark:bg-neutral-900">
                    {LANGUAGE_NAMES[code] || code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                ← Back
              </button>
              <button
                onClick={generateWorkflow}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white transition flex items-center justify-center gap-2"
              >
                {loading ? "⏳ Generating..." : "⚡ Generate Workflow"}
              </button>
            </div>
          </div>

          {/* Right panel: Markers Preview */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                🏷️ Markers Preview
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 leading-relaxed">
                Add these comment pairs into your <code className="font-semibold text-neutral-900 dark:text-white">{readmeFile}</code>. The workflow will inject card contents between them.
              </p>
            </div>
            <CodeBlock code={markers} title={readmeFile} />
          </div>
        </div>
      )}

      {/* Step 3: Download */}
      {step === 3 && yaml && (
        <div className="flex flex-col gap-8">
          {/* Main Action Block: YAML output */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-0.5">
                  ✅ Workflow Ready!
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Your GitHub Actions workflow template is generated.
                </p>
              </div>
              <div className="flex gap-2">
                <CopyButton text={yaml} label="Copy YAML" />
                <a
                  href={dlUrl}
                  download="update-readme-cards.yml"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 transition flex items-center gap-1.5"
                >
                  ⬇️ Download
                </a>
              </div>
            </div>
            <CodeBlock code={yaml} title=".github/workflows/update-readme-cards.yml" />
          </div>

          {/* Markers summary */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                🏷️ Markers to Add to README
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Place these markers in your <code className="font-semibold text-neutral-900 dark:text-white">{readmeFile}</code>. If missing, the workflow will exit with an error.
              </p>
            </div>
            <CodeBlock code={markers} title={readmeFile} />
          </div>

          {/* Setup Instructions */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              🚀 Installation Steps
            </h2>

            <div className="flex flex-col border-t border-neutral-100 dark:border-neutral-800">
              {[
                {
                  n: "1",
                  icon: "📁",
                  t: "Save the workflow file",
                  d: `Place the downloaded 'update-readme-cards.yml' in the '.github/workflows/' directory of your profile repository (the repository named after your GitHub username).`,
                },
                {
                  n: "2",
                  icon: "🏷️",
                  t: "Add markers to your README",
                  d: `Copy the marker comment pairs shown above and paste them into your '${readmeFile}' where you want the dynamic content to be injected.`,
                },
                {
                  n: "3",
                  icon: "🔑",
                  t: "No secrets required",
                  d: "The workflow runs natively on GitHub using the default GITHUB_TOKEN write permission — no third-party credentials or API keys needed.",
                },
                {
                  n: "4",
                  icon: "▶️",
                  t: "Run the workflow",
                  d: "Push changes to your repository, go to the 'Actions' tab, select 'Update README Cards', and click 'Run workflow'. It will also automatically update on your configured schedule.",
                },
                {
                  n: "5",
                  icon: "⚠️",
                  t: "Marker verification check",
                  d: "On every run, the workflow verifies if all selected GRC:... markers exist. If any marker is missing, the run will gracefully fail and display annotations in GitHub pointing out what is missing.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <span>{s.icon}</span>
                      <span>{s.t}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="flex justify-start">
            <button
              onClick={() => {
                setYaml(null);
                setStep(1);
              }}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              ← Restart Wizard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
