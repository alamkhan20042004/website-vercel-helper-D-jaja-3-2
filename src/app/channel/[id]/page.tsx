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

















































































































































































































"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// JSONBIN Details
const BIN_ID = '6a46006af5f4af5e2951f5fc'; 
const API_KEY = '$2a$10$rMbmIiFc3q.cKoBht3ernu32724Pmby9BF874kyybDSrlR7F60hvi';

function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [channels, setChannels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Ready.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [streamName, setStreamName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  // 1. Page Load par Data lana
  useEffect(() => {
    const localData = localStorage.getItem('mySavedChannels');
    if (localData) {
      const parsedChannels = JSON.parse(localData);
      setChannels(parsedChannels);
      setStatusMsg("Loaded from Local Device 📱");
      checkUrlAndPlay(parsedChannels);
    } else {
      syncFromCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. URL Check karna aur specific channel play karna
  const checkUrlAndPlay = (loadedChannels) => {
    if (loadedChannels.length === 0) return;
    const targetChannelName = searchParams.get('ch'); // URL se '?ch=Naam' uthayega
    
    let targetIndex = 0;
    if (targetChannelName) {
      const foundIndex = loadedChannels.findIndex(c => c.name === targetChannelName);
      if (foundIndex !== -1) targetIndex = foundIndex;
    }
    playStream(targetIndex, loadedChannels);
  };

  // 3. Cloud se Fetch
  const syncFromCloud = async () => {
    setIsSyncing(true);
    setStatusMsg("Fetching from Cloud... ⏳");
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await response.json();
      const fetchedChannels = data.record;
      setChannels(fetchedChannels);
      localStorage.setItem('mySavedChannels', JSON.stringify(fetchedChannels));
      setStatusMsg("Cloud Sync Complete ✅");
      checkUrlAndPlay(fetchedChannels);
    } catch (error) {
      setStatusMsg("Sync Error ❌");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Data Save Karna
  const saveData = async (newChannels) => {
    localStorage.setItem('mySavedChannels', JSON.stringify(newChannels));
    setStatusMsg("Updating Cloud... ⏳");
    try {
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(newChannels)
      });
      setStatusMsg("Saved to Cloud ✅");
    } catch (error) {
      setStatusMsg("Cloud Save Failed ❌ (Saved Locally)");
      console.error(error);
    }
  };

  // 5. Play Stream & Update URL Uniquely
  const playStream = (index, currentChannels = channels) => {
    setActiveIndex(index);
    if (currentChannels[index]) {
      const safeName = encodeURIComponent(currentChannels[index].name);
      router.push(`?ch=${safeName}`, { scroll: false });
    }
  };

  // 6. Actions (Add, Edit, Delete)
  const addNewStream = () => {
    if (!streamName || !streamUrl) return alert("Details enter karein!");
    const newChannels = [...channels, { name: streamName, url: streamUrl }];
    setChannels(newChannels);
    setStreamName("");
    setStreamUrl("");
    saveData(newChannels);
  };

  const editStream = (index) => {
    const newName = prompt("Naya Channel Name:", channels[index].name);
    if (newName === null) return; 
    const newUrl = prompt("Naya Iframe Link:", channels[index].url);
    if (newUrl === null) return;

    if (newName.trim() !== '' && newUrl.trim() !== '') {
      const newChannels = [...channels];
      newChannels[index] = { name: newName, url: newUrl };
      setChannels(newChannels);
      saveData(newChannels);
      if (index === activeIndex) playStream(index, newChannels);
    }
  };

  const deleteStream = (index) => {
    if (confirm(`"${channels[index].name}" ko delete karein?`)) {
      const newChannels = channels.filter((_, i) => i !== index);
      setChannels(newChannels);
      
      if (index === activeIndex) {
        setActiveIndex(0); 
        if(newChannels.length > 0) playStream(0, newChannels);
      } else if (index < activeIndex) {
        setActiveIndex(activeIndex - 1);
      }
      saveData(newChannels);
    }
  };

  const currentStreamUrl = channels.length > 0 && channels[activeIndex] ? channels[activeIndex].url : "";

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] text-white font-sans m-0 p-0 overflow-hidden">
      
      {/* Top Bar */}
      <div className="bg-[#1e1e1e] p-4 flex flex-col gap-2 border-b border-[#333]">
        <div className="flex gap-3 items-center flex-wrap">
          <span>➕ New Channel:</span>
          <input
            type="text"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            placeholder="Channel Name"
            className="px-3 py-2 bg-[#2a2a2a] border border-[#444] text-white rounded outline-none"
          />
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="Iframe Link"
            className="px-3 py-2 bg-[#2a2a2a] border border-[#444] text-white rounded outline-none"
          />
          <button onClick={addNewStream} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded transition-colors">
            Save
          </button>
          <button 
            onClick={syncFromCloud} 
            disabled={isSyncing} 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 font-bold rounded transition-colors">
            ⬇️ Sync from Cloud
          </button>
          <span className="text-gray-400 text-sm font-bold ml-2">{statusMsg}</span>
        </div>
      </div>

      {/* Channel List */}
      <div className="bg-[#181818] p-4 flex gap-4 flex-wrap min-h-[70px]">
        {channels.map((ch, index) => (
          <div key={index} className={`flex items-center border rounded-full pr-1 overflow-hidden transition-colors ${index === activeIndex ? 'bg-red-600 border-red-600' : 'bg-[#333] border-[#444]'}`}>
            <button 
              onClick={() => playStream(index)} 
              className="px-4 py-2 bg-transparent text-white font-bold outline-none cursor-pointer">
              {ch.name}
            </button>
            <button 
              onClick={() => editStream(index)} 
              className="p-1 bg-transparent border-none text-white cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 text-sm">
              ✏️
            </button>
            <button 
              onClick={() => deleteStream(index)} 
              className="p-1 bg-transparent border-none text-white cursor-pointer opacity-70 hover:opacity-100 hover:text-red-300 hover:scale-110 text-sm">
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Main Player Container */}
      <div className="flex-1 w-full flex justify-center items-center bg-black">
        {currentStreamUrl ? (
          <iframe
            title={`Live Stream - ${channels[activeIndex]?.name || 'Player'}`}
            marginHeight={0}
            marginWidth={0}
            scrolling="no"
            src={currentStreamUrl} 
            referrerPolicy="no-referrer" // YEH WOH TRICK HAI JO BLOCK HONE SE BACHAYEGI
            allow="encrypted-media; picture-in-picture;"
            allowFullScreen
            width="100%"
            height="100%"
            frameBorder="0"
            className="w-full h-full border-none block m-0 p-0 bg-black"
          />
        ) : (
          <div className="text-gray-500 font-bold text-lg">No stream available</div>
        )}
      </div>

    </div>
  );
}

// Next.js mein 'useSearchParams' istemal karne ke liye isko Suspense mein wrap karna zaroori hai
export default function ChannelPage() {
  return (
    <Suspense fallback={<div className="bg-black w-screen h-screen flex justify-center items-center text-white">Loading Player...</div>}>
      <PlayerContent />
    </Suspense>
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
