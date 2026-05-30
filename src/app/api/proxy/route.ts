import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("URL parameter is missing", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "https://dlhd.pk/",
        "Origin": "https://dlhd.pk",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    let html = await response.text();

    const origin = new URL(url).origin;
    const baseTag = `<base href="${origin}/">`;
    
    // YEH TRICK HAI: JavaScript ko dhoka dene ke liye fake domain set kar rahe hain
    const bypassScript = `
      <script>
        try {
          Object.defineProperty(document, 'domain', { get: function() { return 'dlhd.pk'; } });
        } catch(e) {}
        try {
          Object.defineProperty(window.location, 'hostname', { get: function() { return 'dlhd.pk'; } });
        } catch(e) {}
        try {
           Object.defineProperty(window.location, 'host', { get: function() { return 'dlhd.pk'; } });
        } catch(e) {}
      </script>
    `;

    // Base tag aur Bypass script ko <head> ke foran baad laga rahe hain
    html = html.replace(/<head[^>]*>/i, `$& \n ${baseTag} \n ${bypassScript}`);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new NextResponse("Proxy Error", { status: 500 });
  }
}
