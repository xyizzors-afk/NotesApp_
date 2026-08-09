/**
 * Same-origin proxy for remote PDFs. PDF.js (canvas rendering) needs CORS
 * access to fetch the document; external providers such as caiefinder.com
 * don't always send permissive headers. Fetching server-side avoids that,
 * and the viewer only ever talks to this route.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const download = searchParams.get("download") === "1";
  const filename = searchParams.get("filename");

  if (!url) return new Response("Missing url parameter", { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:") {
    return new Response("Only https URLs are allowed", { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: "follow",
      headers: {
        Accept: "application/pdf,application/octet-stream,*/*",
        // caiefinder.com (and similar file hosts) reject requests that don't
        // look like they came from a real browser — Node's fetch sends no
        // User-Agent/Referer by default, which reads as a bot/script.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: `${target.protocol}//${target.host}/`,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!upstream.ok || !upstream.body) {
      console.error(`[pdf-proxy] upstream ${upstream.status} for ${target.toString()}`);
      return new Response(`Upstream returned ${upstream.status} for this document`, {
        status: upstream.status || 502,
      });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": download
          ? `attachment; filename="${(filename || target.pathname.split("/").pop() || "document.pdf").replace(/"/g, "")}"`
          : "inline",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(`[pdf-proxy] fetch failed for ${target.toString()}:`, err);
    return new Response("Could not reach the PDF provider", { status: 502 });
  }
}