"use client";

import Link from "next/link";
import { version } from "../../package.json";

export default function Home() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center min-h-[75vh]">
      {/* Dynamic Background Blur Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neutral-200 dark:bg-neutral-800 rounded-full blur-[120px] opacity-40 pointer-events-none -z-10" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-semibold tracking-wide mb-6">
        <span>✨</span>
        <span>Version {version} Released</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight max-w-2xl mb-6">
        GitHub Readme <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400 dark:from-white dark:via-neutral-300 dark:to-neutral-500">Cards</span>
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mb-10 leading-relaxed">
        Beautiful, real-time cards and widgets for your GitHub profile README. Add dynamic stats, streaks, top languages, achievements, and keep them auto-updated seamlessly.
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-16">
        <Link
          href="/card-preview"
          className="flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 transition-all duration-150 transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2"
        >
          🃏 Cards Preview
        </Link>
        <Link
          href="/workflow-generator"
          className="flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-150 transform hover:-translate-y-0.5 shadow-sm flex items-center justify-center gap-2"
        >
          🤖 Workflow Setup
        </Link>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl border-t border-neutral-200 dark:border-neutral-800 pt-12 text-left">
        <div>
          <div className="text-lg mb-2">📊</div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Detailed Stats</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Beautifully displays all your public contributions, stars, and commits in a simple layout.
          </p>
        </div>
        <div>
          <div className="text-lg mb-2">🔥</div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Commit Streak</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Track and show off your continuous contribution streaks and active days to the world.
          </p>
        </div>
        <div>
          <div className="text-lg mb-2">🏆</div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Profile Scraper</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Scrapes authentic GitHub achievements and badge multipliers directly from your profile pages.
          </p>
        </div>
      </div>

      {/* Credit footer */}
      <div className="mt-16 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 justify-center">
        <span>Created by</span>
        <a
          href="https://github.com/CodesWithSubham"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline text-neutral-700 dark:text-neutral-300 transition"
        >
          CodesWithSubham
        </a>
      </div>
    </section>
  );
}
