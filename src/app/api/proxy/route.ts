import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("URL parameter is missing", { status: 400 });
  }

  try {
    // Vercel server se request bhej rahe hain, yahan hum headers fake kar sakte hain
    const response = await fetch(url, {
      headers: {
        "Referer": "https://dlhd.pk/", // DaddyLive ko lagega request unhi ki site se hai
        "Origin": "https://dlhd.pk",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    let html = await response.text();

    // Base tag inject karna zaroori hai taake video player ki files (CSS/JS/m3u8) sahi jagah se load hon
    const origin = new URL(url).origin;
    const baseTag = `<base href="${origin}/">`;
    html = html.replace(/<head[^>]*>/i, `$& \n ${baseTag}`);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new NextResponse("Proxy Error", { status: 500 });
  }
}
