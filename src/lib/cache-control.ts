const cacheControlTtl = 60 * 15; // 15 minutes

export const cacheControl = {
  "Cache-Control": `s-maxage=${cacheControlTtl}, stale-while-revalidate`,
};
