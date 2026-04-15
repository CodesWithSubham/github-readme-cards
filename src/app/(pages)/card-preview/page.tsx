"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function CardPreviewPage() {
  const { resolvedTheme: theme } = useTheme();

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
          🃏 Cards Preview
        </h1>
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-6 *:max-w-md">
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
            className="w-full rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800/60"
          />
        ))}
      </div>
    </section>
  );
}
