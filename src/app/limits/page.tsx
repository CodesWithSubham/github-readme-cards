import { getOctokit } from "@/lib/octokit";
import { cacheLife } from "next/cache";
import Link from "next/link";

export default async function LimitsPage() {
  "use cache";
  cacheLife("minutes");

  let data = null;
  let err = null;
  try {
    const octokit = getOctokit();
    const res = await octokit.rest.rateLimit.get();
    data = res.data;
  } catch (e) {
    err = e instanceof Error ? e.message : "Failed";
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-gray-600 dark:text-gray-400 no-underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-extrabold mt-4 mb-1">⚡ API Rate Limits</h1>
      <p className="text-gray-600 dark:text-gray-400 text-xs mb-7">
        Your GitHub API quota — resets hourly.
      </p>

      {err && (
        <div className="p-3.5 bg-red-500/10 border border-red-500 rounded-lg text-red-500 mb-5">
          Error: {err}
        </div>
      )}

      {data?.resources && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {["Resource", "Usage", "Resets (IST)"].map((h) => (
                  <th
                    key={h}
                    className="py-2.75 px-4.5 text-left text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.06em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.resources).map(([name, lim]) => {
                const used = lim.limit - lim.remaining;
                const pct = lim.limit > 0 ? (used / lim.limit) * 100 : 0;
                const color = pct > 80 ? "#f85149" : pct > 50 ? "#d29922" : "#3fb950";
                return (
                  <tr key={name} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3.25 px-4.5">
                      <div className="font-bold">
                        {name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                      <code className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{name}</code>
                    </td>
                    <td className="py-3.25 px-4.5">
                      <div className="text-[13px] font-bold mb-1.5" style={{ color }}>
                        {used.toLocaleString()} / {lim.limit.toLocaleString()}
                      </div>
                      <div className="w-full h-1.25 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-400"
                          style={{
                            width: `${pct}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        {pct.toFixed(1)}% used · {lim.remaining.toLocaleString()} remaining
                      </div>
                    </td>
                    <td className="py-3.25 px-4.5 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(lim.reset * 1000).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-5 text-[12px] text-gray-500 dark:text-gray-400 text-center">
        Data fetched from GitHub API. Updated every minute.
      </p>
    </div>
  );
}
