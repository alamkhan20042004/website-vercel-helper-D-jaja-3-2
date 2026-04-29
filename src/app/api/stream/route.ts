import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (id === 'willow-sports') {
    const targetUrl = "https://embedsports.top/embed/admin/admin-willow-cricket/2";
    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': targetUrl,
        }
      });
      
      let html = await res.text();
      
      // Inject base tag so relative resources load correctly from embedsports.top
      html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="https://embedsports.top/">');
      
      // Inject auto-play script at the end
      const autoplayScript = `
        <script>
          const autoplayInterval = setInterval(() => {
            if (window.jwplayer && typeof window.jwplayer === 'function' && window.jwplayer("player").getState) {
              const state = window.jwplayer("player").getState();
              if (state === "idle" || state === "paused") {
                window.jwplayer("player").play();
              }
              if (state === "playing") {
                 clearInterval(autoplayInterval);
              }
            } else {
              const playBtn = document.querySelector('.jw-icon-display');
              if (playBtn) {
                playBtn.click();
                clearInterval(autoplayInterval);
              }
            }
          }, 500);
          setTimeout(() => clearInterval(autoplayInterval), 10000);
        </script>
      `;
      html += autoplayScript;
      
      const headers = new Headers(res.headers);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.delete('X-Frame-Options');
      headers.delete('Content-Security-Policy');
      
      return new NextResponse(html, {
        status: res.status,
        headers,
      });
    } catch (e) {
      return NextResponse.json({ error: "Failed to load stream" }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
