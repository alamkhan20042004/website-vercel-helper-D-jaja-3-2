// import { getServerUrlById } from "@/lib/data";

// export default async function ChannelPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   // Database se direct link nikalein
//   const serverUrl = await getServerUrlById(id);
//   const streamUrl = serverUrl || `https://example.com/stream/${id}`;
//   const title = `Sports Player - ${id}`;

//   // Check karein agar URL dlhd / daddylive ka hai
//   const isDlpk = streamUrl.includes("dlhd.pk") || streamUrl.includes("daddylive");

//   if (isDlpk) {
//     // YEH WOHI EXACT LOCAL HTML HAI JO AAPNE BANAYA THA
//     // Hum isko directly browser ki memory mein as a separate document load karwayenge
//     const rawLocalHtml = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <meta name="referrer" content="no-referrer">
//           <title>Live Stream Player</title>
//           <style>
//               html, body {
//                   margin: 0;
//                   padding: 0;
//                   width: 100%;
//                   height: 100%;
//                   background-color: #000;
//                   overflow: hidden;
//               }
//               .iframe-container {
//                   width: 100%;
//                   height: 100%;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="iframe-container">
//               <iframe src="${streamUrl}" width="100%" height="100%" style="border:0;" allow="encrypted-media; picture-in-picture" allowfullscreen="true" scrolling="no" referrerpolicy="no-referrer"></iframe>
//           </div>
//       </body>
//       </html>
//     `;

//     // Is code ko Base64/Data URI mein convert kar rahe hain taake Vercel ka domain bypass ho jaye
//     const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(rawLocalHtml)}`;

//     return (
//       <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//         <iframe
//           src={dataUri} // Yahan hamara "Local HTML" inject ho gaya
//           className="w-full h-full border-none block m-0 p-0 bg-black"
//           allowFullScreen
//           allow="encrypted-media; picture-in-picture;"
//         />
//       </div>
//     );
//   }

//   // Agar StreamPK ya koi aur link hai, toh default behavior chalega (isko bilkul nahi chhera)
//   return (
//     <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//       <iframe
//         title={title}
//         src={streamUrl}
//         referrerPolicy="no-referrer"
//         allow="encrypted-media; picture-in-picture;"
//         allowFullScreen
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         className="w-full h-full border-none block m-0 p-0 bg-black"
//       />
//     </div>
//   );
// }
















// Ab hum apni purani file src/app/channel/[id]/page.tsx mein ek choti si condition lagayenge. Agar URL DaddyLive (dlhd.pk) ka hai, toh hamara API proxy use ho, warna direct chahle (jaise streampk ke liye).

// import { getServerUrlById } from "@/lib/data";

// export default async function ChannelPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   // Database se direct link nikalein
//   const serverUrl = await getServerUrlById(id);
//   const streamUrl = serverUrl || `https://example.com/stream/${id}`;
//   const title = `Sports Player - ${id}`;

//   // CONDITION: Check karein agar URL dlhd/daddylive ka hai
//   const isDlpk = streamUrl.includes("dlhd.pk") || streamUrl.includes("daddylive");
  
//   // Agar DaddyLive hai, toh hamara banaya hua proxy use karein, warna original url chalaen
//   const finalIframeSrc = isDlpk 
//     ? `/api/proxy?url=${encodeURIComponent(streamUrl)}` 
//     : streamUrl;

//   return (
//     <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//       <iframe
//         title={title}
//         marginHeight={0}
//         marginWidth={0}
//         scrolling="no"
//         src={finalIframeSrc} // Yahan finalSrc lag gaya
//         referrerPolicy="no-referrer"
//         allow="encrypted-media; picture-in-picture;"
//         allowFullScreen
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         className="w-full h-full border-none block m-0 p-0 bg-black"
//       />
//     </div>
//   );
// }














































































































































































































import { getServerUrlById } from "@/lib/data";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Database se direct link nikalein (Proxy ki zaroorat nahi)
  const serverUrl = await getServerUrlById(id);
  const streamUrl = serverUrl || `https://example.com/stream/${id}`;
  const title = `Sports Player - ${id}`;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0 flex justify-center items-center">
      <iframe
        title={title}
        src={streamUrl}
        
        // 1. ANTI-BLOCKING TRICK (Strict Referrer Bypass)
        referrerPolicy="no-referrer" 
        
        // 2. SMOOTH PLAYBACK & FEATURES
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
        
        // 3. FULLSCREEN SUPPORT (React/Next.js Syntax)
        allowFullScreen={true}
        
        // 4. UI CLEAUP
        marginHeight={0}
        marginWidth={0}
        scrolling="no"
        frameBorder="0"
        
        // 5. TAILWIND FOR PERFECT FIT
        className="w-full h-full border-none block m-0 p-0 bg-black"
      />
    </div>
  );
}










// ===================== upper code mei yeh dlpk k iframe k liye , yeh step 2 hai , step 1 proxy/route.js file hai ==================
// ==================== Alhamdullah ===========================================================================================================



// import { getServerUrlById } from "@/lib/data";

// export default async function ChannelPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   // Database se direct link nikalein (Proxy ki zaroorat nahi)
//   const serverUrl = await getServerUrlById(id);
//   const streamUrl = serverUrl || `https://example.com/stream/${id}`;
//   const title = `Sports Player - ${id}`;

//   return (
//     <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//       <iframe
//         title={title}
//         marginHeight={0}
//         marginWidth={0}
//         scrolling="no"
//         src={streamUrl} // Direct URL lagayen (e.g. https://embedsports.top/...)
//         referrerPolicy="no-referrer" // YEH WOH TRICK HAI JO BLOCK HONE SE BACHAYEGI
//         allow="encrypted-media; picture-in-picture;"
//         allowFullScreen
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         className="w-full h-full border-none block m-0 p-0 bg-black"
//       />
//     </div>
//   );
// }




















// import { getServerUrlById } from "@/lib/data";

// export default async function ChannelPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   const serverUrl = await getServerUrlById(id);
//   const streamUrl = serverUrl || `https://example.com/stream/${id}`;
//   const title = `Sports Player - ${id}`;

//   return (
//     <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//       <iframe
//         title={title}
//         marginHeight={0}
//         marginWidth={0}
//         scrolling="no"
//         src={streamUrl}
//         allow="encrypted-media; picture-in-picture;"
//         allowFullScreen
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         className="w-full h-full border-none block m-0 p-0 bg-black"
//       />
//     </div>
//   );
// }
