export function errorSvg(msg: string, w = 450, h = 60) {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="10" y="35" fill="red" font-family="sans-serif" font-size="13">Error: ${msg}</text></svg>`,
    { headers: { "Content-Type": "image/svg+xml" }, status: 500 },
  );
}
