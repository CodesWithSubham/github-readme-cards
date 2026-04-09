"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const { resolvedTheme: theme } = useTheme();

  return (
    <section>
      <h1 className="text-4xl font-extrabold text-center pt-8 text-neutral-900 dark:text-white">
        Cards Preview
      </h1>

      {/* Cards */}
      <div className="mt-8 flex flex-wrap justify-center gap-5 *:max-w-md">
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
    </section>
  );
}
