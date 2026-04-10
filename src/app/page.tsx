"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const { resolvedTheme: theme } = useTheme();
  const [tab, setTab] = useState<"preview" | "workflow">("preview");

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
        <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
          <p>Coming Soon</p>
        </div>
      )}
    </section>
  );
}
