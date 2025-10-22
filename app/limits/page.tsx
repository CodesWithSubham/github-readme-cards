import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const logRateLimit = async () => {
  try {
    // Fetch rate limit info
    const { data } = await octokit.rest.rateLimit.get();

    return data;
  } catch (error) {
    console.error("Error fetching rate limit:", error);
  }
};

export const dynamic = "force-dynamic"; // <- ensures SSR

export default async function LimitsPage() {
  const rateLimitData = await logRateLimit();
  return (
    <>
      <div>
        <h1>API Rate Limits</h1>
        <p>Check your API rate limits here.</p>
      </div>
      <section>
        {rateLimitData?.resources ? (
          <table className="min-w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Resource</th>
                <th className="border border-gray-300 p-2">Used</th>
                <th className="border border-gray-300 p-2">Reset</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rateLimitData.resources).map(([resource, limits]) => {
                const used = limits.limit - limits.remaining;
                const ratio = limits.limit > 0 ? (used / limits.limit) * 100 : 0;
                return (
                  <tr key={resource}>
                    <td className="border border-gray-300 p-2">
                      <div className="flex flex-col items-center space-y-1">
                        <span>
                          {resource.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>

                        <code className="text-[11px] text-gray-200">{resource}</code>
                      </div>
                    </td>
                    <td
                      className={`border border-gray-300 p-2 font-mono ${
                        ratio > 80
                          ? "text-red-600 font-bold"
                          : ratio > 50
                          ? "text-yellow-600 font-semibold"
                          : ratio > 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {used}/{limits.limit}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {new Date(limits.reset * 1000).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No rate limit data available.</p>
        )}
      </section>
    </>
  );
}
