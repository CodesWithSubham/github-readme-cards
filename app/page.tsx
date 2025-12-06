"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");

  // Detect system theme on first load
  useLayoutEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <section className="min-h-screen bg-neutral-100 dark:bg-neutral-950 transition-colors">
      <h1 className="text-4xl font-extrabold text-center pt-8 text-neutral-900 dark:text-white">
        Cards Preview
      </h1>

      {/* Theme Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={toggleTheme}
          className="px-5 py-2 rounded-lg font-semibold
            bg-neutral-900 text-white
            dark:bg-white dark:text-black
            transition-all"
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>

      {/* Cards */}
      <div className="mt-8 flex flex-wrap justify-center gap-5 *:max-w-md">
        {[
          { src: "/stats", w: 440, h: 210, alt: "GitHub Stats" },
          { src: "/streak", w: 440, h: 210, alt: "GitHub Streak" },
          { src: "/top-lang", w: 300, h: 160, alt: "Top Languages" },
        ].map(({ src, w, h, alt }) => (
          <Image
            key={src}
            src={`/api${src}${theme === "dark" ? "/dark" : ""}`}
            unoptimized
            alt={alt}
            width={w}
            height={h}
            className="w-full rounded-xl shadow-lg"
          />
        ))}
      </div>
    </section>
  );
}
