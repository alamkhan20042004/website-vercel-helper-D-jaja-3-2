"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Website, Category, Channel, Server } from "@/lib/data";

export default function Home() {
  const [websitesData, setWebsitesData] = useState<Website[]>([]);
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [serverModal, setServerModal] = useState({
    isOpen: false,
    mode: "add",
    websiteId: "",
    categoryName: "",
    channelId: "",
    serverId: "",
    serversList: [{ name: "", url: "", startTime: "" }],
    showBulk: false,
    bulkText: "",
    bulkTime: "" 
  });

  const [csvModal, setCsvModal] = useState({
    isOpen: false,
    channel: null as Channel | null,
    baseChannel: "1",
    includeBase: true,
    startTime: "",
    duration: ""
  });

  useEffect(() => {
    fetch('/api/websites')
      .then(res => res.json())
      .then(data => {
        setWebsitesData(data);
        setIsLoading(false);
      });
  }, []);

  const saveData = async (newData: Website[]) => {
    setWebsitesData(newData);
    await fetch('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
  };

  const toggleChannel = (channelId: string) => {
    if (isEditMode) return;
    setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
  };

  const openCsvModal = (channel: Channel) => {
    if (channel.servers.length === 0) {
      alert("No servers available to copy!");
      return;
    }
    setCsvModal({
      isOpen: true,
      channel: channel,
      baseChannel: "1",
      includeBase: true,
      startTime: "",
      duration: ""
    });
  };

  const handleCopyCSV = () => {
    if (!csvModal.channel) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let csvData = "TargetURL,Channel,Quality,Server,StartTime,Duration\n";
    
    const globalSTime = csvModal.startTime.trim() || "None";
    const dur = csvModal.duration.trim() || "None";

    csvModal.channel.servers.forEach((server, index) => {
      let channelNum;
      if (csvModal.includeBase) {
        channelNum = index === 0 ? csvModal.baseChannel : `${csvModal.baseChannel}.${index}`;
      } else {
        channelNum = `${csvModal.baseChannel}.${index + 1}`;
      }
      const finalStartTime = server.startTime || globalSTime;
      csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None,${finalStartTime},${dur}\n`;
    });

    navigator.clipboard.writeText(csvData)
      .then(() => {
        alert(`${csvModal.channel?.name} ka CSV data copy ho gaya hai!`);
        setCsvModal({ ...csvModal, isOpen: false });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Copy karne mein masla pesh aaya.");
      });
  };

  const addCategory = (websiteId: string) => {
    const name = window.prompt("Enter new category name (e.g., Baseball):");
    if (!name) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: [...ws.categories, { name, channels: [] }] } : ws);
    saveData(newData);
  };

  const editCategory = (websiteId: string, oldName: string) => {
    const newName = window.prompt("Edit category name:", oldName);
    if (!newName || newName === oldName) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c) } : ws);
    saveData(newData);
  };

  const deleteCategory = (websiteId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) } : ws);
    saveData(newData);
  };

  const addChannel = (websiteId: string, categoryName: string) => {
    const name = window.prompt("Enter new channel name (e.g., Star Sports):");
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const color = "from-gray-800 to-gray-600";
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: [...c.channels, { id, name, color, servers: [] }] } : c) } : ws);
    saveData(newData);
  };

  const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
    const newName = window.prompt("Edit channel name:", oldName);
    if (!newName || newName === oldName) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch) } : c) } : ws);
    saveData(newData);
  };

  const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
    if (!window.confirm("Are you sure you want to delete this channel?")) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.filter(ch => ch.id !== channelId) } : c) } : ws);
    saveData(newData);
  };

  const extractUrl = (input: string) => {
    const match = input.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : input.trim();
  };

  const openAddServerModal = (websiteId: string, categoryName: string, channelId: string) => {
    setServerModal({
      isOpen: true,
      mode: "add",
      websiteId,
      categoryName,
      channelId,
      serverId: "",
      serversList: [{ name: "", url: "", startTime: "" }],
      showBulk: false,
      bulkText: "",
      bulkTime: "" 
    });
  };

  const openEditServerModal = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string, oldStartTime?: string) => {
    setServerModal({
      isOpen: true,
      mode: "edit",
      websiteId,
      categoryName,
      channelId,
      serverId,
      serversList: [{ name: oldName, url: oldUrl, startTime: oldStartTime || "" }],
      showBulk: false,
      bulkText: "",
      bulkTime: "" 
    });
  };

  const handleModalInputChange = (index: number, field: "name" | "url" | "startTime", value: string) => {
    const newList = [...serverModal.serversList];
    newList[index][field] = value;
    setServerModal({ ...serverModal, serversList: newList });
  };

  const addModalRow = () => {
    setServerModal({ ...serverModal, serversList: [...serverModal.serversList, { name: "", url: "", startTime: "" }] });
  };

  const removeModalRow = (index: number) => {
    const newList = serverModal.serversList.filter((_, i) => i !== index);
    setServerModal({ ...serverModal, serversList: newList });
  };

  const processBulkImport = () => {
    const text = serverModal.bulkText;
    if (!text.trim()) return;

    const regex = /src=["']([^"']+)["']/gi;
    const extractedUrls: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      extractedUrls.push(match[1]);
    }

    if (extractedUrls.length === 0) {
      const rawUrls = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith("http"));
      extractedUrls.push(...rawUrls);
    }

    if (extractedUrls.length === 0) {
      alert("Is data mein koi iframe src ya URL nahi mila. Please check your text.");
      return;
    }

    const currentValid = serverModal.serversList.filter(s => s.name.trim() || s.url.trim());
    
    const startIndex = currentValid.length;
    const newRows = extractedUrls.map((url, index) => ({
      name: `Server ${startIndex + index + 1}`,
      url: url,
      startTime: serverModal.bulkTime || "" 
    }));

    setServerModal({
      ...serverModal,
      serversList: [...currentValid, ...newRows],
      showBulk: false,
      bulkText: ""
    });
  };

  const handleServerModalSubmit = () => {
    const validServers = serverModal.serversList.filter(s => s.name.trim() && s.url.trim());

    if (validServers.length === 0) {
      alert("Please fill at least one server completely!");
      return;
    }

    const newData = websitesData.map(ws => {
      if (ws.id === serverModal.websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === serverModal.categoryName) {
              return {
                ...c,
                channels: c.channels.map(ch => {
                  if (ch.id === serverModal.channelId) {
                    if (serverModal.mode === "add") {
                      const newServers = validServers.map((s, idx) => ({
                        id: `${serverModal.channelId}-s${Date.now()}-${idx}`,
                        name: s.name,
                        url: extractUrl(s.url),
                        startTime: s.startTime
                      }));
                      return { ...ch, servers: [...ch.servers, ...newServers] };
                    } else {
                      const editedServer = validServers[0];
                      return {
                        ...ch,
                        servers: ch.servers.map(s => s.id === serverModal.serverId ? { ...s, name: editedServer.name, url: extractUrl(editedServer.url), startTime: editedServer.startTime } : s)
                      };
                    }
                  }
                  return ch;
                })
              };
            }
            return c;
          })
        };
      }
      return ws;
    });

    saveData(newData);
    setServerModal({ ...serverModal, isOpen: false });
  };

  const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
    if (!window.confirm("Are you sure you want to delete this server?")) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: ch.servers.filter(s => s.id !== serverId) } : ch) } : c) } : ws);
    saveData(newData);
  };

  const deleteAllServers = (websiteId: string, categoryName: string, channelId: string) => {
    if (!window.confirm("⚠️ WARNING: Kya aap waqayi is channel ke SAARE SERVERS delete karna chahte hain? Yeh wapas nahi aayenge!")) return;
    const newData = websitesData.map(ws => ws.id === websiteId ? { 
      ...ws, 
      categories: ws.categories.map(c => c.name === categoryName ? { 
        ...c, 
        channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: [] } : ch) 
      } : c) 
    } : ws);
    saveData(newData);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)] relative">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
            Live Sports
          </h1>
          <p className="mt-4 text-gray-400 text-lg">Select a channel to view available servers.</p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-6 py-3 rounded-full font-bold transition-all ${isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
        </button>
      </header>

      <main className="space-y-16">
        {websitesData.map((website) => (
          <section key={website.id} className="space-y-8">
            <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">{website.name}</h2>
            {website.categories.map((category) => (
              <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-400">{category.name}</h3>
                  {isEditMode && (
                    <div className="flex gap-2">
                      <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
                      <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
                      <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.channels.map((channel) => (
                    <div key={channel.id} className="flex flex-col gap-2 relative">
                      <div
                        onClick={() => toggleChannel(channel.id)}
                        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
                      >
                        <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
                          <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
                              <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold text-white text-center">{channel.name}</span>
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                          <button onClick={() => editChannel(website.id, category.name, channel.id, channel.name)} className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                          </button>
                          <button onClick={() => deleteChannel(website.id, category.name, channel.id)} className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}

                      {(expandedChannelId === channel.id || isEditMode) && (
                        <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                          {channel.servers.length > 0 && (
                            <button onClick={() => openCsvModal(channel)} className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                              Copy CSV Data
                            </button>
                          )}
                          {channel.servers.map((server) => (
                            <div key={server.id} className="flex gap-2">
                              {isEditMode ? (
                                <div className="flex-1 flex flex-col p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-80">
                                  <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
                                  {server.startTime && <span className="text-xs text-blue-400 mt-1">🕒 {new Date(server.startTime).toLocaleString()}</span>}
                                </div>
                              ) : (
                                <Link href={`/channel/${server.id}`} className="flex-1 flex flex-col p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-gray-300 font-medium">{server.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                                  </div>
                                  {server.startTime && <span className="text-xs text-blue-400 mt-1">🕒 {new Date(server.startTime).toLocaleString()}</span>}
                                </Link>
                              )}
                              
                              {isEditMode && (
                                <div className="flex flex-col gap-1 justify-center">
                                  {/* @ts-ignore */}
                                  <button onClick={() => openEditServerModal(website.id, category.name, channel.id, server.id, server.name, server.url, server.startTime)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg transition-colors border border-gray-700 flex-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                  </button>
                                  <button onClick={() => deleteServer(website.id, category.name, channel.id, server.id)} className="bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded-lg transition-colors border border-red-900/50 flex-1 flex items-center justify-center" title="Delete this server">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {isEditMode && (
                            <div className="flex flex-col gap-2 mt-1">
                              <button onClick={() => openAddServerModal(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed">
                                + Add Server(s)
                              </button>
                              
                              {channel.servers.length > 0 && (
                                <button onClick={() => deleteAllServers(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-800/50 text-red-400 transition-colors font-medium border-dashed text-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                  Delete All Servers
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditMode && category.channels.length === 0 && (
                    <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
                      No channels yet
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEditMode && (
              <button onClick={() => addCategory(website.id)} className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg">
                + Add Sport Category
              </button>
            )}
          </section>
        ))}
      </main>

      {/* CSV EXPORT MODAL */}
      {csvModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Export to CSV</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Base Channel No.</label>
                <input
                  type="text"
                  value={csvModal.baseChannel}
                  onChange={(e) => setCsvModal({...csvModal, baseChannel: e.target.value})}
                  className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
                  placeholder="e.g., 1 or s1"
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-700 cursor-pointer" onClick={() => setCsvModal({...csvModal, includeBase: !csvModal.includeBase})}>
                <input type="checkbox" checked={csvModal.includeBase} readOnly className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
                <span className="text-sm text-gray-300">Include Base (e.g., 1, 1.1, 1.2 instead of 1.1, 1.2)</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Default Start Time (Optional)</label>
                <input
                  type="text"
                  value={csvModal.startTime}
                  onChange={(e) => setCsvModal({...csvModal, startTime: e.target.value})}
                  className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
                  placeholder="Agar server mein time nahi to yeh use hoga"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Optional)</label>
                <input
                  type="text"
                  value={csvModal.duration}
                  onChange={(e) => setCsvModal({...csvModal, duration: e.target.value})}
                  className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
                  placeholder="e.g., 4h 30m"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setCsvModal({ ...csvModal, isOpen: false })} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">Cancel</button>
              <button onClick={handleCopyCSV} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ADD/EDIT SERVER MODAL */}
      {serverModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Main Full-Screen Container */}
          <div className="flex-1 w-full h-full max-w-7xl mx-auto flex flex-col p-4 md:p-8">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-800 pb-4">
              <h3 className="text-3xl font-bold text-white">
                {serverModal.mode === "add" ? "Add New Server(s)" : "Edit Server"}
              </h3>
              
              <div className="flex gap-4">
                {serverModal.mode === "add" && (
                  <button onClick={() => setServerModal({ ...serverModal, showBulk: !serverModal.showBulk })} className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600/50 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    {serverModal.showBulk ? "Close Bulk Import" : "Auto Bulk Import"}
                  </button>
                )}
                
                {/* Top Close Button for quick exit */}
                <button onClick={() => setServerModal({ ...serverModal, isOpen: false })} className="text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 p-2 rounded-lg border border-gray-800 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Master Time Controller & Bulk Import Options */}
            <div className="shrink-0 mb-6 flex flex-col gap-4">
              <div className="bg-blue-900/10 p-5 rounded-2xl border border-blue-900/30 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-blue-400 mb-2">
                    ⏱️ Master Time Controller
                  </label>
                  <input
                    type="datetime-local"
                    value={serverModal.bulkTime}
                    onChange={(e) => setServerModal({ ...serverModal, bulkTime: e.target.value })}
                    className="w-full bg-gray-950 text-white p-3 rounded-xl border border-blue-500/50 focus:border-blue-500 outline-none [color-scheme:dark]"
                  />
                </div>
                
                <div className="w-full md:w-2/3 bg-[#0a0a0a]/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-sm text-gray-400 mb-3 font-medium">Select servers below to apply this master time:</p>
                  <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[100px] pr-2 custom-scrollbar">
                    {serverModal.serversList.map((serverInput, index) => {
                      const hasTime = serverInput.startTime && serverInput.startTime !== "";
                      const isSelectedWithBulk = serverInput.startTime === serverModal.bulkTime && serverModal.bulkTime !== "";
                      
                      let labelClasses = "bg-gray-800 border-gray-700 hover:bg-gray-700";
                      if (isSelectedWithBulk) {
                        labelClasses = "bg-blue-900/40 border-blue-500/50";
                      } else if (hasTime) {
                        labelClasses = "bg-green-900/30 border-green-500/50";
                      }

                      return (
                        <label 
                          key={index} 
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all border ${labelClasses}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelectedWithBulk}
                            onChange={(e) => {
                              if (!serverModal.bulkTime) {
                                alert("Please set Master Time first!");
                                return;
                              }
                              const newTime = e.target.checked ? serverModal.bulkTime : "";
                              handleModalInputChange(index, "startTime", newTime);
                            }}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-gray-300">Server #{index + 1}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {serverModal.showBulk && serverModal.mode === "add" && (
                <div className="bg-indigo-900/10 p-5 rounded-2xl border border-indigo-900/30">
                  <label className="block text-sm font-medium text-indigo-300 mb-2">Paste Multiple Iframes or URLs here</label>
                  <textarea
                    className="w-full bg-gray-950 text-gray-300 p-4 rounded-xl border border-indigo-900/50 focus:border-indigo-500 outline-none resize-none h-32 text-sm font-mono"
                    placeholder='<iframe src="https://..."></iframe>&#10;<iframe src="https://..."></iframe>'
                    value={serverModal.bulkText}
                    onChange={(e) => setServerModal({ ...serverModal, bulkText: e.target.value })}
                  />
                  <button onClick={processBulkImport} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors text-lg shadow-lg shadow-indigo-900/20">
                    Extract Links & Auto-Fill
                  </button>
                </div>
              )}
            </div>
            
            {/* Scrollable Server List Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6 space-y-4 custom-scrollbar">
              {serverModal.serversList.map((serverInput, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 bg-gray-900 p-5 rounded-2xl border border-gray-800 relative group items-start hover:border-gray-700 transition-colors">
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <span className="text-blue-400 font-bold mr-2 text-lg">#{index + 1}</span> Server Name
                    </label>
                    <input
                      type="text"
                      placeholder={`Server ${index + 1}`}
                      value={serverInput.name}
                      onChange={(e) => handleModalInputChange(index, "name", e.target.value)}
                      className="w-full bg-[#0a0a0a] text-white p-3.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-colors"
                      autoFocus={index === 0 && !serverModal.showBulk}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Iframe/Link URL</label>
                    <input
                      type="text"
                      placeholder="e.g., https://..."
                      value={serverInput.url}
                      onChange={(e) => handleModalInputChange(index, "url", e.target.value)}
                      className="w-full bg-[#0a0a0a] text-white p-3.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Match Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={serverInput.startTime || ""}
                      onChange={(e) => handleModalInputChange(index, "startTime", e.target.value)}
                      className="w-full bg-[#0a0a0a] text-white p-3.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none [color-scheme:dark] transition-colors"
                    />
                  </div>
                  
                  {serverModal.mode === "add" && serverModal.serversList.length > 1 && (
                    <button 
                      onClick={() => removeModalRow(index)}
                      className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 shadow-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                      title="Remove Row"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Fixed Footer with Actions */}
            <div className="pt-6 mt-2 border-t border-gray-800 flex justify-between items-center shrink-0 bg-[#0a0a0a]">
              <div>
                {serverModal.mode === "add" && (
                  <button onClick={addModalRow} className="px-5 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 font-medium transition-colors flex items-center text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add One Empty Row
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setServerModal({ ...serverModal, isOpen: false })} className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 rounded-xl text-white font-medium transition-colors text-lg border border-gray-800">
                  Cancel
                </button>
                <button onClick={handleServerModalSubmit} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all text-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5">
                  Save All Data
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}






































// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const [serverModal, setServerModal] = useState({
//     isOpen: false,
//     mode: "add",
//     websiteId: "",
//     categoryName: "",
//     channelId: "",
//     serverId: "",
//     serversList: [{ name: "", url: "", startTime: "" }],
//     showBulk: false,
//     bulkText: "",
//     bulkTime: "" 
//   });

//   const [csvModal, setCsvModal] = useState({
//     isOpen: false,
//     channel: null as Channel | null,
//     baseChannel: "1",
//     includeBase: true,
//     startTime: "",
//     duration: ""
//   });

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return;
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   const openCsvModal = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }
//     setCsvModal({
//       isOpen: true,
//       channel: channel,
//       baseChannel: "1",
//       includeBase: true,
//       startTime: "",
//       duration: ""
//     });
//   };

//   const handleCopyCSV = () => {
//     if (!csvModal.channel) return;

//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
//     let csvData = "TargetURL,Channel,Quality,Server,StartTime,Duration\n";
    
//     const globalSTime = csvModal.startTime.trim() || "None";
//     const dur = csvModal.duration.trim() || "None";

//     csvModal.channel.servers.forEach((server, index) => {
//       let channelNum;
//       if (csvModal.includeBase) {
//         channelNum = index === 0 ? csvModal.baseChannel : `${csvModal.baseChannel}.${index}`;
//       } else {
//         channelNum = `${csvModal.baseChannel}.${index + 1}`;
//       }
//       const finalStartTime = server.startTime || globalSTime;
//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None,${finalStartTime},${dur}\n`;
//     });

//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${csvModal.channel?.name} ka CSV data copy ho gaya hai!`);
//         setCsvModal({ ...csvModal, isOpen: false });
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: [...ws.categories, { name, channels: [] }] } : ws);
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) } : ws);
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600";
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: [...c.channels, { id, name, color, servers: [] }] } : c) } : ws);
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.filter(ch => ch.id !== channelId) } : c) } : ws);
//     saveData(newData);
//   };

//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   const openAddServerModal = (websiteId: string, categoryName: string, channelId: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "add",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId: "",
//       serversList: [{ name: "", url: "", startTime: "" }],
//       showBulk: false,
//       bulkText: "",
//       bulkTime: "" 
//     });
//   };

//   const openEditServerModal = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string, oldStartTime?: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "edit",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId,
//       serversList: [{ name: oldName, url: oldUrl, startTime: oldStartTime || "" }],
//       showBulk: false,
//       bulkText: "",
//       bulkTime: "" 
//     });
//   };

//   const handleModalInputChange = (index: number, field: "name" | "url" | "startTime", value: string) => {
//     const newList = [...serverModal.serversList];
//     newList[index][field] = value;
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const addModalRow = () => {
//     setServerModal({ ...serverModal, serversList: [...serverModal.serversList, { name: "", url: "", startTime: "" }] });
//   };

//   const removeModalRow = (index: number) => {
//     const newList = serverModal.serversList.filter((_, i) => i !== index);
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const processBulkImport = () => {
//     const text = serverModal.bulkText;
//     if (!text.trim()) return;

//     const regex = /src=["']([^"']+)["']/gi;
//     const extractedUrls: string[] = [];
//     let match;
    
//     while ((match = regex.exec(text)) !== null) {
//       extractedUrls.push(match[1]);
//     }

//     if (extractedUrls.length === 0) {
//       const rawUrls = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith("http"));
//       extractedUrls.push(...rawUrls);
//     }

//     if (extractedUrls.length === 0) {
//       alert("Is data mein koi iframe src ya URL nahi mila. Please check your text.");
//       return;
//     }

//     const currentValid = serverModal.serversList.filter(s => s.name.trim() || s.url.trim());
    
//     const startIndex = currentValid.length;
//     const newRows = extractedUrls.map((url, index) => ({
//       name: `Server ${startIndex + index + 1}`,
//       url: url,
//       startTime: serverModal.bulkTime || "" 
//     }));

//     setServerModal({
//       ...serverModal,
//       serversList: [...currentValid, ...newRows],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const handleServerModalSubmit = () => {
//     const validServers = serverModal.serversList.filter(s => s.name.trim() && s.url.trim());

//     if (validServers.length === 0) {
//       alert("Please fill at least one server completely!");
//       return;
//     }

//     const newData = websitesData.map(ws => {
//       if (ws.id === serverModal.websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === serverModal.categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === serverModal.channelId) {
//                     if (serverModal.mode === "add") {
//                       const newServers = validServers.map((s, idx) => ({
//                         id: `${serverModal.channelId}-s${Date.now()}-${idx}`,
//                         name: s.name,
//                         url: extractUrl(s.url),
//                         startTime: s.startTime
//                       }));
//                       return { ...ch, servers: [...ch.servers, ...newServers] };
//                     } else {
//                       const editedServer = validServers[0];
//                       return {
//                         ...ch,
//                         servers: ch.servers.map(s => s.id === serverModal.serverId ? { ...s, name: editedServer.name, url: extractUrl(editedServer.url), startTime: editedServer.startTime } : s)
//                       };
//                     }
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });

//     saveData(newData);
//     setServerModal({ ...serverModal, isOpen: false });
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: ch.servers.filter(s => s.id !== serverId) } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteAllServers = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("⚠️ WARNING: Kya aap waqayi is channel ke SAARE SERVERS delete karna chahte hain? Yeh wapas nahi aayenge!")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { 
//       ...ws, 
//       categories: ws.categories.map(c => c.name === categoryName ? { 
//         ...c, 
//         channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: [] } : ch) 
//       } : c) 
//     } : ws);
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)] relative">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">Select a channel to view available servers.</p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">{website.name}</h2>
//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">{category.name}</h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">{channel.name}</span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button onClick={() => editChannel(website.id, category.name, channel.id, channel.name)} className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button onClick={() => deleteChannel(website.id, category.name, channel.id)} className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
//                           {channel.servers.length > 0 && (
//                             <button onClick={() => openCsvModal(channel)} className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm">
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}
//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex flex-col p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-80">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                   {server.startTime && <span className="text-xs text-blue-400 mt-1">🕒 {new Date(server.startTime).toLocaleString()}</span>}
//                                 </div>
//                               ) : (
//                                 <Link href={`/channel/${server.id}`} className="flex-1 flex flex-col p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200">
//                                   <div className="flex justify-between items-center w-full">
//                                     <span className="text-gray-300 font-medium">{server.name}</span>
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                   </div>
//                                   {server.startTime && <span className="text-xs text-blue-400 mt-1">🕒 {new Date(server.startTime).toLocaleString()}</span>}
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <div className="flex flex-col gap-1 justify-center">
//                                   {/* @ts-ignore */}
//                                   <button onClick={() => openEditServerModal(website.id, category.name, channel.id, server.id, server.name, server.url, server.startTime)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg transition-colors border border-gray-700 flex-1 flex items-center justify-center">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button onClick={() => deleteServer(website.id, category.name, channel.id, server.id)} className="bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded-lg transition-colors border border-red-900/50 flex-1 flex items-center justify-center" title="Delete this server">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <div className="flex flex-col gap-2 mt-1">
//                               <button onClick={() => openAddServerModal(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed">
//                                 + Add Server(s)
//                               </button>
                              
//                               {channel.servers.length > 0 && (
//                                 <button onClick={() => deleteAllServers(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-800/50 text-red-400 transition-colors font-medium border-dashed text-sm">
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   Delete All Servers
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button onClick={() => addCategory(website.id)} className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg">
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>

//       {/* CSV EXPORT MODAL */}
//       {csvModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
//             <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Export to CSV</h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Base Channel No.</label>
//                 <input
//                   type="text"
//                   value={csvModal.baseChannel}
//                   onChange={(e) => setCsvModal({...csvModal, baseChannel: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="e.g., 1 or s1"
//                 />
//               </div>
//               <div className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-700 cursor-pointer" onClick={() => setCsvModal({...csvModal, includeBase: !csvModal.includeBase})}>
//                 <input type="checkbox" checked={csvModal.includeBase} readOnly className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
//                 <span className="text-sm text-gray-300">Include Base (e.g., 1, 1.1, 1.2 instead of 1.1, 1.2)</span>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Default Start Time (Optional)</label>
//                 <input
//                   type="text"
//                   value={csvModal.startTime}
//                   onChange={(e) => setCsvModal({...csvModal, startTime: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="Agar server mein time nahi to yeh use hoga"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Optional)</label>
//                 <input
//                   type="text"
//                   value={csvModal.duration}
//                   onChange={(e) => setCsvModal({...csvModal, duration: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="e.g., 4h 30m"
//                 />
//               </div>
//             </div>

//             <div className="pt-6 mt-6 border-t border-gray-800 flex justify-end gap-3">
//               <button onClick={() => setCsvModal({ ...csvModal, isOpen: false })} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">Cancel</button>
//               <button onClick={handleCopyCSV} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50 flex items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                 Copy to Clipboard
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ADD/EDIT SERVER MODAL */}
//       {serverModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           {/* NAYA: overflow-hidden lagaya taakey footer bahar na nikle */}
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-6xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
            
//             <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-800 pb-4">
//               <h3 className="text-2xl font-bold text-white">
//                 {serverModal.mode === "add" ? "Add New Server(s)" : "Edit Server"}
//               </h3>
              
//               {serverModal.mode === "add" && (
//                 <button onClick={() => setServerModal({ ...serverModal, showBulk: !serverModal.showBulk })} className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/50 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-600/50 transition-colors flex items-center gap-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
//                   {serverModal.showBulk ? "Close Bulk Import" : "Auto Bulk Import"}
//                 </button>
//               )}
//             </div>

//             {/* --- MASTER TIME CONTROLLER + DYNAMIC CHECKBOXES --- */}
//             <div className="mb-4 shrink-0 bg-blue-900/10 p-5 rounded-xl border border-blue-900/30 flex flex-col md:flex-row gap-6 items-start">
//               <div className="w-full md:w-1/3">
//                 <label className="block text-sm font-medium text-blue-400 mb-2">
//                   ⏱️ Master Time Controller
//                 </label>
//                 <input
//                   type="datetime-local"
//                   value={serverModal.bulkTime}
//                   onChange={(e) => setServerModal({ ...serverModal, bulkTime: e.target.value })}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-blue-500/50 focus:border-blue-500 outline-none [color-scheme:dark]"
//                 />
//               </div>
              
//               <div className="w-full md:w-2/3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
//                 <p className="text-xs text-gray-400 mb-3 font-medium">Select servers below to apply this master time:</p>
//                 <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[80px] pr-2">
//                   {serverModal.serversList.map((serverInput, index) => {
//                     const hasTime = serverInput.startTime && serverInput.startTime !== "";
//                     const isSelectedWithBulk = serverInput.startTime === serverModal.bulkTime && serverModal.bulkTime !== "";
                    
//                     // NAYA: Green styling logic add ki hai
//                     let labelClasses = "bg-gray-800 border-gray-700 hover:bg-gray-700";
//                     if (isSelectedWithBulk) {
//                       labelClasses = "bg-blue-900/40 border-blue-500/50";
//                     } else if (hasTime) {
//                       labelClasses = "bg-green-900/30 border-green-500/50";
//                     }

//                     return (
//                       <label 
//                         key={index} 
//                         className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${labelClasses}`}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={isSelectedWithBulk}
//                           onChange={(e) => {
//                             if (!serverModal.bulkTime) {
//                               alert("Please set Master Time first!");
//                               return;
//                             }
//                             const newTime = e.target.checked ? serverModal.bulkTime : "";
//                             handleModalInputChange(index, "startTime", newTime);
//                           }}
//                           className="w-4 h-4 accent-blue-600 cursor-pointer"
//                         />
//                         <span className="text-xs font-bold text-gray-300">Server #{index + 1}</span>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {serverModal.showBulk && serverModal.mode === "add" && (
//               <div className="mb-6 shrink-0 bg-indigo-900/10 p-4 rounded-xl border border-indigo-900/30">
//                 <label className="block text-sm font-medium text-indigo-300 mb-2">Paste Multiple Iframes or URLs here</label>
//                 <textarea
//                   className="w-full bg-gray-950 text-gray-300 p-3 rounded-lg border border-indigo-900/50 focus:border-indigo-500 outline-none resize-none h-32 text-sm font-mono"
//                   placeholder='<iframe src="https://..."></iframe>&#10;<iframe src="https://..."></iframe>'
//                   value={serverModal.bulkText}
//                   onChange={(e) => setServerModal({ ...serverModal, bulkText: e.target.value })}
//                 />
//                 <button onClick={processBulkImport} className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors">
//                   Extract Links & Auto-Fill
//                 </button>
//               </div>
//             )}
            
//             {/* NAYA: min-h-0 lagaya flex-1 k sath taakey container apna size theek calculate karey */}
//             <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2 space-y-4">
//               {serverModal.serversList.map((serverInput, index) => (
//                 <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative group items-start">
                  
//                   <div className="flex-1 w-full">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">
//                       <span className="text-blue-400 font-bold mr-1">#{index + 1}</span> Server Name
//                     </label>
//                     <input
//                       type="text"
//                       placeholder={`Server ${index + 1}`}
//                       value={serverInput.name}
//                       onChange={(e) => handleModalInputChange(index, "name", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                       autoFocus={index === 0 && !serverModal.showBulk}
//                     />
//                   </div>
//                   <div className="flex-1 w-full">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Iframe/Link URL</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., https://..."
//                       value={serverInput.url}
//                       onChange={(e) => handleModalInputChange(index, "url", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                     />
//                   </div>
//                   <div className="flex-1 w-full">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Match Time (Optional)</label>
//                     <input
//                       type="datetime-local"
//                       value={serverInput.startTime || ""}
//                       onChange={(e) => handleModalInputChange(index, "startTime", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none [color-scheme:dark]"
//                     />
//                   </div>
                  
//                   {serverModal.mode === "add" && serverModal.serversList.length > 1 && (
//                     <button 
//                       onClick={() => removeModalRow(index)}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
//                       title="Remove Row"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Yeh footer shrink-0 rakha hai taakey bottom pe fixed rahay */}
//             <div className="pt-4 mt-2 border-t border-gray-800 flex justify-between items-center shrink-0">
//               <div>
//                 {serverModal.mode === "add" && (
//                   <button onClick={addModalRow} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-medium transition-colors flex items-center text-sm">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
//                     Add One Empty Row
//                   </button>
//                 )}
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setServerModal({ ...serverModal, isOpen: false })} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">Cancel</button>
//                 <button onClick={handleServerModalSubmit} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50">Save All Data</button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




















// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Modal State ab Bulk Text ko bhi handle karegi
//   const [serverModal, setServerModal] = useState({
//     isOpen: false,
//     mode: "add",
//     websiteId: "",
//     categoryName: "",
//     channelId: "",
//     serverId: "",
//     serversList: [{ name: "", url: "" }],
//     showBulk: false,
//     bulkText: ""
//   });

//   // 🚀 NAYA: CSV Copy karne ke liye Smart Modal State
//   const [csvModal, setCsvModal] = useState({
//     isOpen: false,
//     channel: null as Channel | null,
//     baseChannel: "1",
//     includeBase: true,
//     startTime: "",
//     duration: ""
//   });

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return;
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   // 🚀 NAYA: Sirf Modal Open Karega
//   const openCsvModal = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }
//     setCsvModal({
//       isOpen: true,
//       channel: channel,
//       baseChannel: "1",
//       includeBase: true,
//       startTime: "",
//       duration: ""
//     });
//   };

//   // 🚀 NAYA: Modal se data le kar CSV Generate aur Copy Karega
//   const handleCopyCSV = () => {
//     if (!csvModal.channel) return;

//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
//     // Naye Columns add kar diye gaye hain
//     let csvData = "TargetURL,Channel,Quality,Server,StartTime,Duration\n";
    
//     // Agar input khali hai toh "None" default set hoga
//     const sTime = csvModal.startTime.trim() || "None";
//     const dur = csvModal.duration.trim() || "None";

//     csvModal.channel.servers.forEach((server, index) => {
//       let channelNum;
//       if (csvModal.includeBase) {
//         channelNum = index === 0 ? csvModal.baseChannel : `${csvModal.baseChannel}.${index}`;
//       } else {
//         channelNum = `${csvModal.baseChannel}.${index + 1}`;
//       }
//       // Naya CSV Format with 6 columns
//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None,${sTime},${dur}\n`;
//     });

//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${csvModal.channel?.name} ka CSV data copy ho gaya hai!`);
//         setCsvModal({ ...csvModal, isOpen: false });
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   // --- CRUD Functions for Category & Channel ---
//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: [...ws.categories, { name, channels: [] }] } : ws);
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) } : ws);
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600";
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: [...c.channels, { id, name, color, servers: [] }] } : c) } : ws);
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.filter(ch => ch.id !== channelId) } : c) } : ws);
//     saveData(newData);
//   };

//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   // --- MULTIPLE SERVERS MODAL LOGIC ---
//   const openAddServerModal = (websiteId: string, categoryName: string, channelId: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "add",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId: "",
//       serversList: [{ name: "", url: "" }],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const openEditServerModal = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "edit",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId,
//       serversList: [{ name: oldName, url: oldUrl }],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const handleModalInputChange = (index: number, field: "name" | "url", value: string) => {
//     const newList = [...serverModal.serversList];
//     newList[index][field] = value;
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const addModalRow = () => {
//     setServerModal({ ...serverModal, serversList: [...serverModal.serversList, { name: "", url: "" }] });
//   };

//   const removeModalRow = (index: number) => {
//     const newList = serverModal.serversList.filter((_, i) => i !== index);
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const processBulkImport = () => {
//     const text = serverModal.bulkText;
//     if (!text.trim()) return;

//     const regex = /src=["']([^"']+)["']/gi;
//     const extractedUrls: string[] = [];
//     let match;
    
//     while ((match = regex.exec(text)) !== null) {
//       extractedUrls.push(match[1]);
//     }

//     if (extractedUrls.length === 0) {
//       const rawUrls = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith("http"));
//       extractedUrls.push(...rawUrls);
//     }

//     if (extractedUrls.length === 0) {
//       alert("Is data mein koi iframe src ya URL nahi mila. Please check your text.");
//       return;
//     }

//     const currentValid = serverModal.serversList.filter(s => s.name.trim() || s.url.trim());
    
//     const startIndex = currentValid.length;
//     const newRows = extractedUrls.map((url, index) => ({
//       name: `Server ${startIndex + index + 1}`,
//       url: url
//     }));

//     setServerModal({
//       ...serverModal,
//       serversList: [...currentValid, ...newRows],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const handleServerModalSubmit = () => {
//     const validServers = serverModal.serversList.filter(s => s.name.trim() && s.url.trim());

//     if (validServers.length === 0) {
//       alert("Please fill at least one server completely!");
//       return;
//     }

//     const newData = websitesData.map(ws => {
//       if (ws.id === serverModal.websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === serverModal.categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === serverModal.channelId) {
//                     if (serverModal.mode === "add") {
//                       const newServers = validServers.map((s, idx) => ({
//                         id: `${serverModal.channelId}-s${Date.now()}-${idx}`,
//                         name: s.name,
//                         url: extractUrl(s.url)
//                       }));
//                       return { ...ch, servers: [...ch.servers, ...newServers] };
//                     } else {
//                       const editedServer = validServers[0];
//                       return {
//                         ...ch,
//                         servers: ch.servers.map(s => s.id === serverModal.serverId ? { ...s, name: editedServer.name, url: extractUrl(editedServer.url) } : s)
//                       };
//                     }
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });

//     saveData(newData);
//     setServerModal({ ...serverModal, isOpen: false });
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: ch.servers.filter(s => s.id !== serverId) } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)] relative">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">Select a channel to view available servers.</p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">{website.name}</h2>
//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">{category.name}</h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">{channel.name}</span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button onClick={() => editChannel(website.id, category.name, channel.id, channel.name)} className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button onClick={() => deleteChannel(website.id, category.name, channel.id)} className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
//                           {channel.servers.length > 0 && (
//                             <button onClick={() => openCsvModal(channel)} className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm">
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}
//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link href={`/channel/${server.id}`} className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200">
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button onClick={() => openEditServerModal(website.id, category.name, channel.id, server.id, server.name, server.url)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button onClick={() => deleteServer(website.id, category.name, channel.id, server.id)} className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button onClick={() => openAddServerModal(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1">
//                               + Add Server(s)
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button onClick={() => addCategory(website.id)} className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg">
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>

//       {/* --- CSV EXPORT MODAL UI (NAYA) --- */}
//       {csvModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
//             <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Export to CSV</h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Base Channel No.</label>
//                 <input
//                   type="text"
//                   value={csvModal.baseChannel}
//                   onChange={(e) => setCsvModal({...csvModal, baseChannel: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="e.g., 1 or s1"
//                 />
//               </div>

//               <div className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-700 cursor-pointer" onClick={() => setCsvModal({...csvModal, includeBase: !csvModal.includeBase})}>
//                 <input type="checkbox" checked={csvModal.includeBase} readOnly className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
//                 <span className="text-sm text-gray-300">Include Base (e.g., 1, 1.1, 1.2 instead of 1.1, 1.2)</span>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Start Time (Optional)</label>
//                 <input
//                   type="text"
//                   value={csvModal.startTime}
//                   onChange={(e) => setCsvModal({...csvModal, startTime: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="e.g., 2026-05-25 08:00 PM"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Optional)</label>
//                 <input
//                   type="text"
//                   value={csvModal.duration}
//                   onChange={(e) => setCsvModal({...csvModal, duration: e.target.value})}
//                   className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
//                   placeholder="e.g., 4h 30m"
//                 />
//               </div>
//             </div>

//             <div className="pt-6 mt-6 border-t border-gray-800 flex justify-end gap-3">
//               <button onClick={() => setCsvModal({ ...csvModal, isOpen: false })} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
//                 Cancel
//               </button>
//               <button onClick={handleCopyCSV} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50 flex items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                 Copy to Clipboard
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- ADD/EDIT SERVER MODAL UI --- */}
//       {serverModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
//             <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-800 pb-4">
//               <h3 className="text-2xl font-bold text-white">
//                 {serverModal.mode === "add" ? "Add New Server(s)" : "Edit Server"}
//               </h3>
              
//               {/* Bulk Import Toggle Button */}
//               {serverModal.mode === "add" && (
//                 <button
//                   onClick={() => setServerModal({ ...serverModal, showBulk: !serverModal.showBulk })}
//                   className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/50 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-600/50 transition-colors flex items-center gap-2"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
//                   {serverModal.showBulk ? "Close Bulk Import" : "Auto Bulk Import"}
//                 </button>
//               )}
//             </div>

//             {/* Bulk Import Section */}
//             {serverModal.showBulk && serverModal.mode === "add" && (
//               <div className="mb-6 shrink-0 bg-indigo-900/10 p-4 rounded-xl border border-indigo-900/30">
//                 <label className="block text-sm font-medium text-indigo-300 mb-2">
//                   Paste Multiple Iframes or URLs here (Comma or newline separated)
//                 </label>
//                 <textarea
//                   className="w-full bg-gray-950 text-gray-300 p-3 rounded-lg border border-indigo-900/50 focus:border-indigo-500 outline-none resize-none h-32 text-sm font-mono"
//                   placeholder='<iframe src="https://..."></iframe>&#10;<iframe src="https://..."></iframe>'
//                   value={serverModal.bulkText}
//                   onChange={(e) => setServerModal({ ...serverModal, bulkText: e.target.value })}
//                 />
//                 <button
//                   onClick={processBulkImport}
//                   className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors"
//                 >
//                   Extract Links & Auto-Fill
//                 </button>
//               </div>
//             )}
            
//             {/* Scrollable area for Manual/Extracted inputs */}
//             <div className="overflow-y-auto pr-2 pb-4 space-y-4 flex-1">
//               {serverModal.serversList.map((serverInput, index) => (
//                 <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative group">
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Server Name</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., Server 1"
//                       value={serverInput.name}
//                       onChange={(e) => handleModalInputChange(index, "name", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                       autoFocus={index === 0 && !serverModal.showBulk}
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Iframe/Link URL</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., https://..."
//                       value={serverInput.url}
//                       onChange={(e) => handleModalInputChange(index, "url", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                     />
//                   </div>
                  
//                   {serverModal.mode === "add" && serverModal.serversList.length > 1 && (
//                     <button 
//                       onClick={() => removeModalRow(index)}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
//                       title="Remove Row"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Modal Actions */}
//             <div className="pt-6 mt-4 border-t border-gray-800 flex justify-between items-center shrink-0">
//               <div>
//                 {serverModal.mode === "add" && (
//                   <button onClick={addModalRow} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-medium transition-colors flex items-center text-sm">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
//                     Add One Empty Row
//                   </button>
//                 )}
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setServerModal({ ...serverModal, isOpen: false })} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
//                   Cancel
//                 </button>
//                 <button onClick={handleServerModalSubmit} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50">
//                   Save All Data
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


















// ================= iss code mei yeh 2 new columns add keya hai for action ==================


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Modal State ab Bulk Text ko bhi handle karegi
//   const [serverModal, setServerModal] = useState({
//     isOpen: false,
//     mode: "add",
//     websiteId: "",
//     categoryName: "",
//     channelId: "",
//     serverId: "",
//     serversList: [{ name: "", url: "" }],
//     showBulk: false, // Bulk input field show/hide karne ke liye
//     bulkText: ""     // Bulk text store karne ke liye
//   });

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return;
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   const copyChannelCSV = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }
//     const baseChannel = window.prompt("Enter base channel value (e.g., 1, 2, s1):", "1");
//     if (!baseChannel) return;

//     const includeBase = window.confirm(
//       `Kya aap '${baseChannel}' ko sequence mein add karna chahte hain?\n\n` +
//       `OK (Yes) = ${baseChannel}, ${baseChannel}.1, ${baseChannel}.2 ...\n` +
//       `Cancel (No) = ${baseChannel}.1, ${baseChannel}.2, ${baseChannel}.3 ...`
//     );

//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
//     let csvData = "TargetURL,Channel,Quality,Server\n";
    
//     channel.servers.forEach((server, index) => {
//       let channelNum;
//       if (includeBase) {
//         channelNum = index === 0 ? baseChannel : `${baseChannel}.${index}`;
//       } else {
//         channelNum = `${baseChannel}.${index + 1}`;
//       }
//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None\n`;
//     });

//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${channel.name} ka CSV data copy ho gaya hai!`);
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   // --- CRUD Functions for Category & Channel ---
//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: [...ws.categories, { name, channels: [] }] } : ws);
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) } : ws);
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600";
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: [...c.channels, { id, name, color, servers: [] }] } : c) } : ws);
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.filter(ch => ch.id !== channelId) } : c) } : ws);
//     saveData(newData);
//   };

//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   // --- MULTIPLE SERVERS MODAL LOGIC ---
//   const openAddServerModal = (websiteId: string, categoryName: string, channelId: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "add",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId: "",
//       serversList: [{ name: "", url: "" }],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const openEditServerModal = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "edit",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId,
//       serversList: [{ name: oldName, url: oldUrl }],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const handleModalInputChange = (index: number, field: "name" | "url", value: string) => {
//     const newList = [...serverModal.serversList];
//     newList[index][field] = value;
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const addModalRow = () => {
//     setServerModal({ ...serverModal, serversList: [...serverModal.serversList, { name: "", url: "" }] });
//   };

//   const removeModalRow = (index: number) => {
//     const newList = serverModal.serversList.filter((_, i) => i !== index);
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   // --- BULK EXTRACTION LOGIC ---
//   const processBulkImport = () => {
//     const text = serverModal.bulkText;
//     if (!text.trim()) return;

//     // Regular Expression to find all src="" or src='' values
//     const regex = /src=["']([^"']+)["']/gi;
//     const extractedUrls: string[] = [];
//     let match;
    
//     while ((match = regex.exec(text)) !== null) {
//       extractedUrls.push(match[1]);
//     }

//     // Agar iframe format mein nahi tha aur just comma/newline separated URLs the
//     if (extractedUrls.length === 0) {
//       const rawUrls = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith("http"));
//       extractedUrls.push(...rawUrls);
//     }

//     if (extractedUrls.length === 0) {
//       alert("Is data mein koi iframe src ya URL nahi mila. Please check your text.");
//       return;
//     }

//     // Filter out completely empty current rows so we don't have blank fields sitting there
//     const currentValid = serverModal.serversList.filter(s => s.name.trim() || s.url.trim());
    
//     // Create new server rows starting from "Server 1" or continuing from existing
//     const startIndex = currentValid.length;
//     const newRows = extractedUrls.map((url, index) => ({
//       name: `Server ${startIndex + index + 1}`,
//       url: url
//     }));

//     setServerModal({
//       ...serverModal,
//       serversList: [...currentValid, ...newRows],
//       showBulk: false,
//       bulkText: ""
//     });
//   };

//   const handleServerModalSubmit = () => {
//     const validServers = serverModal.serversList.filter(s => s.name.trim() && s.url.trim());

//     if (validServers.length === 0) {
//       alert("Please fill at least one server completely!");
//       return;
//     }

//     const newData = websitesData.map(ws => {
//       if (ws.id === serverModal.websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === serverModal.categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === serverModal.channelId) {
//                     if (serverModal.mode === "add") {
//                       const newServers = validServers.map((s, idx) => ({
//                         id: `${serverModal.channelId}-s${Date.now()}-${idx}`,
//                         name: s.name,
//                         url: extractUrl(s.url)
//                       }));
//                       return { ...ch, servers: [...ch.servers, ...newServers] };
//                     } else {
//                       const editedServer = validServers[0];
//                       return {
//                         ...ch,
//                         servers: ch.servers.map(s => s.id === serverModal.serverId ? { ...s, name: editedServer.name, url: extractUrl(editedServer.url) } : s)
//                       };
//                     }
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });

//     saveData(newData);
//     setServerModal({ ...serverModal, isOpen: false });
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;
//     const newData = websitesData.map(ws => ws.id === websiteId ? { ...ws, categories: ws.categories.map(c => c.name === categoryName ? { ...c, channels: c.channels.map(ch => ch.id === channelId ? { ...ch, servers: ch.servers.filter(s => s.id !== serverId) } : ch) } : c) } : ws);
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)] relative">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">Select a channel to view available servers.</p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">{website.name}</h2>
//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">{category.name}</h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">{channel.name}</span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button onClick={() => editChannel(website.id, category.name, channel.id, channel.name)} className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button onClick={() => deleteChannel(website.id, category.name, channel.id)} className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
//                           {channel.servers.length > 0 && (
//                             <button onClick={() => copyChannelCSV(channel)} className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm">
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}
//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link href={`/channel/${server.id}`} className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200">
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button onClick={() => openEditServerModal(website.id, category.name, channel.id, server.id, server.name, server.url)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button onClick={() => deleteServer(website.id, category.name, channel.id, server.id)} className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button onClick={() => openAddServerModal(website.id, category.name, channel.id)} className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1">
//                               + Add Server(s)
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button onClick={() => addCategory(website.id)} className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg">
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>

//       {/* --- ADD/EDIT SERVER MODAL UI --- */}
//       {serverModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
//             <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-800 pb-4">
//               <h3 className="text-2xl font-bold text-white">
//                 {serverModal.mode === "add" ? "Add New Server(s)" : "Edit Server"}
//               </h3>
              
//               {/* Bulk Import Toggle Button */}
//               {serverModal.mode === "add" && (
//                 <button
//                   onClick={() => setServerModal({ ...serverModal, showBulk: !serverModal.showBulk })}
//                   className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/50 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-600/50 transition-colors flex items-center gap-2"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
//                   {serverModal.showBulk ? "Close Bulk Import" : "Auto Bulk Import"}
//                 </button>
//               )}
//             </div>

//             {/* Bulk Import Section */}
//             {serverModal.showBulk && serverModal.mode === "add" && (
//               <div className="mb-6 shrink-0 bg-indigo-900/10 p-4 rounded-xl border border-indigo-900/30">
//                 <label className="block text-sm font-medium text-indigo-300 mb-2">
//                   Paste Multiple Iframes or URLs here (Comma or newline separated)
//                 </label>
//                 <textarea
//                   className="w-full bg-gray-950 text-gray-300 p-3 rounded-lg border border-indigo-900/50 focus:border-indigo-500 outline-none resize-none h-32 text-sm font-mono"
//                   placeholder='<iframe src="https://..."></iframe>&#10;<iframe src="https://..."></iframe>'
//                   value={serverModal.bulkText}
//                   onChange={(e) => setServerModal({ ...serverModal, bulkText: e.target.value })}
//                 />
//                 <button
//                   onClick={processBulkImport}
//                   className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors"
//                 >
//                   Extract Links & Auto-Fill
//                 </button>
//               </div>
//             )}
            
//             {/* Scrollable area for Manual/Extracted inputs */}
//             <div className="overflow-y-auto pr-2 pb-4 space-y-4 flex-1">
//               {serverModal.serversList.map((serverInput, index) => (
//                 <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative group">
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Server Name</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., Server 1"
//                       value={serverInput.name}
//                       onChange={(e) => handleModalInputChange(index, "name", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                       autoFocus={index === 0 && !serverModal.showBulk}
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Iframe/Link URL</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., https://..."
//                       value={serverInput.url}
//                       onChange={(e) => handleModalInputChange(index, "url", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
//                     />
//                   </div>
                  
//                   {serverModal.mode === "add" && serverModal.serversList.length > 1 && (
//                     <button 
//                       onClick={() => removeModalRow(index)}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
//                       title="Remove Row"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Modal Actions */}
//             <div className="pt-6 mt-4 border-t border-gray-800 flex justify-between items-center shrink-0">
//               <div>
//                 {serverModal.mode === "add" && (
//                   <button onClick={addModalRow} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-medium transition-colors flex items-center text-sm">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
//                     Add One Empty Row
//                   </button>
//                 )}
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setServerModal({ ...serverModal, isOpen: false })} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
//                   Cancel
//                 </button>
//                 <button onClick={handleServerModalSubmit} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50">
//                   Save All Data
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
















// 1 


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Updated State to handle Multiple Servers in Modal
//   const [serverModal, setServerModal] = useState({
//     isOpen: false,
//     mode: "add", // 'add' or 'edit'
//     websiteId: "",
//     categoryName: "",
//     channelId: "",
//     serverId: "",
//     serversList: [{ name: "", url: "" }] // Array to handle multiple inputs
//   });

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return;
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   // --- CSV Copy Function ---
//   const copyChannelCSV = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }

//     const baseChannel = window.prompt("Enter base channel value (e.g., 1, 2, s1):", "1");
//     if (!baseChannel) return;

//     const includeBase = window.confirm(
//       `Kya aap '${baseChannel}' ko sequence mein add karna chahte hain?\n\n` +
//       `OK (Yes) = ${baseChannel}, ${baseChannel}.1, ${baseChannel}.2 ...\n` +
//       `Cancel (No) = ${baseChannel}.1, ${baseChannel}.2, ${baseChannel}.3 ...`
//     );

//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
//     let csvData = "TargetURL,Channel,Quality,Server\n";
    
//     channel.servers.forEach((server, index) => {
//       let channelNum;
//       if (includeBase) {
//         channelNum = index === 0 ? baseChannel : `${baseChannel}.${index}`;
//       } else {
//         channelNum = `${baseChannel}.${index + 1}`;
//       }
//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None\n`;
//     });

//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${channel.name} ka CSV data copy ho gaya hai!\nSequence: ${includeBase ? baseChannel + ", " + baseChannel + ".1..." : baseChannel + ".1, " + baseChannel + ".2..."}`);
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   // --- CRUD Functions for Category & Channel ---

//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: [...ws.categories, { name, channels: [] }] };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c)
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600";

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: [...c.channels, { id, name, color, servers: [] }] };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch)
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: c.channels.filter(ch => ch.id !== channelId) };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   // --- MULTIPLE SERVERS MODAL LOGIC ---

//   const openAddServerModal = (websiteId: string, categoryName: string, channelId: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "add",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId: "",
//       serversList: [{ name: "", url: "" }], // Start with 1 empty row
//     });
//   };

//   const openEditServerModal = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     setServerModal({
//       isOpen: true,
//       mode: "edit",
//       websiteId,
//       categoryName,
//       channelId,
//       serverId,
//       serversList: [{ name: oldName, url: oldUrl }], // Edit only handles 1 item
//     });
//   };

//   // Handle Input Changes in Modal
//   const handleModalInputChange = (index: number, field: "name" | "url", value: string) => {
//     const newList = [...serverModal.serversList];
//     newList[index][field] = value;
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   // Add a new row in Add Modal
//   const addModalRow = () => {
//     setServerModal({
//       ...serverModal,
//       serversList: [...serverModal.serversList, { name: "", url: "" }]
//     });
//   };

//   // Remove a row in Add Modal
//   const removeModalRow = (index: number) => {
//     const newList = serverModal.serversList.filter((_, i) => i !== index);
//     setServerModal({ ...serverModal, serversList: newList });
//   };

//   const handleServerModalSubmit = () => {
//     // Filter out rows that are completely empty
//     const validServers = serverModal.serversList.filter(s => s.name.trim() && s.url.trim());

//     if (validServers.length === 0) {
//       alert("Please fill at least one server completely!");
//       return;
//     }

//     const newData = websitesData.map(ws => {
//       if (ws.id === serverModal.websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === serverModal.categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === serverModal.channelId) {
                    
//                     if (serverModal.mode === "add") {
//                       // Map all valid items into final server objects
//                       // Added an index to Date.now() to ensure IDs remain unique if mapped in milliseconds
//                       const newServers = validServers.map((s, idx) => ({
//                         id: `${serverModal.channelId}-s${Date.now()}-${idx}`,
//                         name: s.name,
//                         url: extractUrl(s.url)
//                       }));
//                       return { ...ch, servers: [...ch.servers, ...newServers] };
//                     } 
                    
//                     else {
//                       // Edit mode (Only 1 item is ever in the array during edit)
//                       const editedServer = validServers[0];
//                       return {
//                         ...ch,
//                         servers: ch.servers.map(s => 
//                           s.id === serverModal.serverId 
//                             ? { ...s, name: editedServer.name, url: extractUrl(editedServer.url) } 
//                             : s
//                         )
//                       };
//                     }
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });

//     saveData(newData);
//     setServerModal({ ...serverModal, isOpen: false });
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: ch.servers.filter(s => s.id !== serverId) };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)] relative">
      
//       {/* HEADER */}
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">
//             Select a channel to view available servers.
//           </p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${
//             isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//           }`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       {/* MAIN CONTENT */}
//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
//               {website.name}
//             </h2>

//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">
//                     {category.name}
//                   </h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       {/* Channel Card */}
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">
//                             {channel.name}
//                           </span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button 
//                             onClick={() => editChannel(website.id, category.name, channel.id, channel.name)}
//                             className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg"
//                             title="Edit Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button 
//                             onClick={() => deleteChannel(website.id, category.name, channel.id)}
//                             className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg"
//                             title="Delete Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {/* Servers Dropdown / List */}
//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                          
//                           {channel.servers.length > 0 && (
//                             <button
//                               onClick={() => copyChannelCSV(channel)}
//                               className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}

//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link
//                                   href={`/channel/${server.id}`}
//                                   className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
//                                 >
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button 
//                                     onClick={() => openEditServerModal(website.id, category.name, channel.id, server.id, server.name, server.url)}
//                                     className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700"
//                                     title="Edit Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button 
//                                     onClick={() => deleteServer(website.id, category.name, channel.id, server.id)}
//                                     className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50"
//                                     title="Delete Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button
//                               onClick={() => openAddServerModal(website.id, category.name, channel.id)}
//                               className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1"
//                             >
//                               + Add Server(s)
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button
//                 onClick={() => addCategory(website.id)}
//                 className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg"
//               >
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>

//       {/* --- ADD/EDIT SERVER MODAL UI (Now supports multiple rows) --- */}
//       {serverModal.isOpen && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
//             <h3 className="text-2xl font-bold text-white mb-6 shrink-0">
//               {serverModal.mode === "add" ? "Add New Server(s)" : "Edit Server"}
//             </h3>
            
//             {/* Scrollable area for inputs */}
//             <div className="overflow-y-auto pr-2 pb-4 space-y-4 flex-1">
//               {serverModal.serversList.map((serverInput, index) => (
//                 <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative">
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Server Name</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., Server 1"
//                       value={serverInput.name}
//                       onChange={(e) => handleModalInputChange(index, "name", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
//                       autoFocus={index === 0}
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-medium text-gray-400 mb-1">Iframe/Link URL</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., https://..."
//                       value={serverInput.url}
//                       onChange={(e) => handleModalInputChange(index, "url", e.target.value)}
//                       className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
//                     />
//                   </div>
                  
//                   {/* Delete Row Button (Only in Add Mode if there's more than 1 row) */}
//                   {serverModal.mode === "add" && serverModal.serversList.length > 1 && (
//                     <button 
//                       onClick={() => removeModalRow(index)}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-colors"
//                       title="Remove Row"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Modal Actions */}
//             <div className="pt-6 mt-4 border-t border-gray-800 flex justify-between shrink-0">
//               <div>
//                 {serverModal.mode === "add" && (
//                   <button 
//                     onClick={addModalRow}
//                     className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-medium transition-colors flex items-center text-sm"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
//                     Add Another Server
//                   </button>
//                 )}
//               </div>
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => setServerModal({ ...serverModal, isOpen: false })} 
//                   className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   onClick={handleServerModalSubmit} 
//                   className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-900/50"
//                 >
//                   Save {serverModal.mode === "add" ? "All" : ""}
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

















// ================= alhamdullah teek hai, bas upper yeh popu mulitie aty hai yeh teek akrty hai =======================


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return; // Prevent toggling while editing to avoid accidental clicks
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   // --- CSV Copy Function ---
// // --- CSV Copy Function ---
//   const copyChannelCSV = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }

//     // Pehla Input: Base value poochega
//     const baseChannel = window.prompt("Enter base channel value (e.g., 1, 2, s1):", "1");
//     if (!baseChannel) return; // Agar user cancel kar de

//     // Doosra Input: Yes/No confirmation
//     const includeBase = window.confirm(
//       `Kya aap '${baseChannel}' ko sequence mein add karna chahte hain?\n\n` +
//       `OK (Yes) = ${baseChannel}, ${baseChannel}.1, ${baseChannel}.2 ...\n` +
//       `Cancel (No) = ${baseChannel}.1, ${baseChannel}.2, ${baseChannel}.3 ...`
//     );

//     // Get the base URL dynamically
//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
//     let csvData = "TargetURL,Channel,Quality,Server\n";
    
//     channel.servers.forEach((server, index) => {
//       let channelNum;
      
//       if (includeBase) {
//         // Agar Yes select kiya: Pehla index base value hoga, baqi mein .1, .2 lagega
//         channelNum = index === 0 ? baseChannel : `${baseChannel}.${index}`;
//       } else {
//         // Agar No select kiya: Sab mein .1, .2, .3 lagega
//         channelNum = `${baseChannel}.${index + 1}`;
//       }

//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None\n`;
//     });

//     // Copy to clipboard
//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${channel.name} ka CSV data copy ho gaya hai!\nSequence: ${includeBase ? baseChannel + ", " + baseChannel + ".1..." : baseChannel + ".1, " + baseChannel + ".2..."}`);
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   // --- CRUD Functions ---

//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: [...ws.categories, { name, channels: [] }] };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c)
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600"; // default color

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: [...c.channels, { id, name, color, servers: [] }] };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch)
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: c.channels.filter(ch => ch.id !== channelId) };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   // Utility to extract URL if the user pastes a full iframe tag
//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   const addServer = (websiteId: string, categoryName: string, channelId: string) => {
//     const name = window.prompt("Enter server name (e.g., Server 4):");
//     if (!name) return;
//     const rawUrl = window.prompt("Enter iframe source URL (e.g., https://dlstreams...):");
//     if (!rawUrl) return;
    
//     const url = extractUrl(rawUrl);
//     const serverId = `${channelId}-s${Date.now()}`;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: [...ch.servers, { id: serverId, name, url }] };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editServer = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     const newName = window.prompt("Edit server name:", oldName);
//     if (!newName) return;
//     const rawUrl = window.prompt("Edit iframe source URL:", oldUrl);
//     if (!rawUrl) return;

//     const newUrl = extractUrl(rawUrl);

//     if (newName === oldName && newUrl === oldUrl) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return {
//                       ...ch,
//                       servers: ch.servers.map(s => s.id === serverId ? { ...s, name: newName, url: newUrl } : s)
//                     };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: ch.servers.filter(s => s.id !== serverId) };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">
//             Select a channel to view available servers.
//           </p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${
//             isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//           }`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
//               {website.name}
//             </h2>

//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">
//                     {category.name}
//                   </h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       {/* Channel Card */}
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">
//                             {channel.name}
//                           </span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button 
//                             onClick={() => editChannel(website.id, category.name, channel.id, channel.name)}
//                             className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg"
//                             title="Edit Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button 
//                             onClick={() => deleteChannel(website.id, category.name, channel.id)}
//                             className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg"
//                             title="Delete Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {/* Servers Dropdown / List (Always expanded in Edit Mode) */}
//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                          
//                           {/* NEW ADDITION: Copy CSV Button */}
//                           {channel.servers.length > 0 && (
//                             <button
//                               onClick={() => copyChannelCSV(channel)}
//                               className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}

//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link
//                                   href={`/channel/${server.id}`}
//                                   className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
//                                 >
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button 
//                                     onClick={() => editServer(website.id, category.name, channel.id, server.id, server.name, server.url)}
//                                     className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700"
//                                     title="Edit Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button 
//                                     onClick={() => deleteServer(website.id, category.name, channel.id, server.id)}
//                                     className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50"
//                                     title="Delete Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button
//                               onClick={() => addServer(website.id, category.name, channel.id)}
//                               className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1"
//                             >
//                               + Add Server
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button
//                 onClick={() => addCategory(website.id)}
//                 className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg"
//               >
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>
//     </div>
//   );
// }
























// 1


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return; // Prevent toggling while editing to avoid accidental clicks
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   // --- CSV Copy Function ---
//   const copyChannelCSV = (channel: Channel) => {
//     if (channel.servers.length === 0) {
//       alert("No servers available to copy!");
//       return;
//     }

//     // Get the base URL dynamically (e.g., https://website-vercel-helper-d-jaja-3-2.vercel.app)
//     const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
//     let csvData = "TargetURL,Channel,Quality,Server\n";
    
//     channel.servers.forEach((server, index) => {
//       // Alternating between '1' and '1.1' as per your example structure
//       const channelNum = index % 2 === 0 ? "1" : "1.1"; 
//       csvData += `${baseUrl}/channel/${server.id},${channelNum},110KBps (Balanced 480p),None\n`;
//     });

//     // Copy to clipboard
//     navigator.clipboard.writeText(csvData)
//       .then(() => {
//         alert(`${channel.name} ka CSV data copy ho gaya hai!`);
//       })
//       .catch((err) => {
//         console.error("Failed to copy text: ", err);
//         alert("Copy karne mein masla pesh aaya.");
//       });
//   };

//   // --- CRUD Functions ---

//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: [...ws.categories, { name, channels: [] }] };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c)
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600"; // default color

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: [...c.channels, { id, name, color, servers: [] }] };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch)
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: c.channels.filter(ch => ch.id !== channelId) };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   // Utility to extract URL if the user pastes a full iframe tag
//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   const addServer = (websiteId: string, categoryName: string, channelId: string) => {
//     const name = window.prompt("Enter server name (e.g., Server 4):");
//     if (!name) return;
//     const rawUrl = window.prompt("Enter iframe source URL (e.g., https://dlstreams...):");
//     if (!rawUrl) return;
    
//     const url = extractUrl(rawUrl);
//     const serverId = `${channelId}-s${Date.now()}`;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: [...ch.servers, { id: serverId, name, url }] };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editServer = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     const newName = window.prompt("Edit server name:", oldName);
//     if (!newName) return;
//     const rawUrl = window.prompt("Edit iframe source URL:", oldUrl);
//     if (!rawUrl) return;

//     const newUrl = extractUrl(rawUrl);

//     if (newName === oldName && newUrl === oldUrl) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return {
//                       ...ch,
//                       servers: ch.servers.map(s => s.id === serverId ? { ...s, name: newName, url: newUrl } : s)
//                     };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: ch.servers.filter(s => s.id !== serverId) };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">
//             Select a channel to view available servers.
//           </p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${
//             isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//           }`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
//               {website.name}
//             </h2>

//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">
//                     {category.name}
//                   </h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       {/* Channel Card */}
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">
//                             {channel.name}
//                           </span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button 
//                             onClick={() => editChannel(website.id, category.name, channel.id, channel.name)}
//                             className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg"
//                             title="Edit Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button 
//                             onClick={() => deleteChannel(website.id, category.name, channel.id)}
//                             className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg"
//                             title="Delete Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {/* Servers Dropdown / List (Always expanded in Edit Mode) */}
//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                          
//                           {/* NEW ADDITION: Copy CSV Button */}
//                           {channel.servers.length > 0 && (
//                             <button
//                               onClick={() => copyChannelCSV(channel)}
//                               className="w-full flex items-center justify-center p-2 mb-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-400 transition-colors font-medium text-sm"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
//                               Copy CSV Data
//                             </button>
//                           )}

//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link
//                                   href={`/channel/${server.id}`}
//                                   className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
//                                 >
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button 
//                                     onClick={() => editServer(website.id, category.name, channel.id, server.id, server.name, server.url)}
//                                     className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700"
//                                     title="Edit Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button 
//                                     onClick={() => deleteServer(website.id, category.name, channel.id, server.id)}
//                                     className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50"
//                                     title="Delete Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button
//                               onClick={() => addServer(website.id, category.name, channel.id)}
//                               className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1"
//                             >
//                               + Add Server
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button
//                 onClick={() => addCategory(website.id)}
//                 className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg"
//               >
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>
//     </div>
//   );
// }






























// ==================== Alhamdullah good , bas yeh print statment add karty hai csv data =====================



// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Website, Category, Channel, Server } from "@/lib/data";

// export default function Home() {
//   const [websitesData, setWebsitesData] = useState<Website[]>([]);
//   const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetch('/api/websites')
//       .then(res => res.json())
//       .then(data => {
//         setWebsitesData(data);
//         setIsLoading(false);
//       });
//   }, []);

//   const saveData = async (newData: Website[]) => {
//     setWebsitesData(newData);
//     await fetch('/api/websites', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newData),
//     });
//   };

//   const toggleChannel = (channelId: string) => {
//     if (isEditMode) return; // Prevent toggling while editing to avoid accidental clicks
//     setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
//   };

//   // --- CRUD Functions ---

//   const addCategory = (websiteId: string) => {
//     const name = window.prompt("Enter new category name (e.g., Baseball):");
//     if (!name) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: [...ws.categories, { name, channels: [] }] };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editCategory = (websiteId: string, oldName: string) => {
//     const newName = window.prompt("Edit category name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c)
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteCategory = (websiteId: string, categoryName: string) => {
//     if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const addChannel = (websiteId: string, categoryName: string) => {
//     const name = window.prompt("Enter new channel name (e.g., Star Sports):");
//     if (!name) return;
//     const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     const color = "from-gray-800 to-gray-600"; // default color

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: [...c.channels, { id, name, color, servers: [] }] };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
//     const newName = window.prompt("Edit channel name:", oldName);
//     if (!newName || newName === oldName) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch)
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
//     if (!window.confirm("Are you sure you want to delete this channel?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return { ...c, channels: c.channels.filter(ch => ch.id !== channelId) };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   // Utility to extract URL if the user pastes a full iframe tag
//   const extractUrl = (input: string) => {
//     const match = input.match(/src=["']([^"']+)["']/i);
//     return match ? match[1] : input.trim();
//   };

//   const addServer = (websiteId: string, categoryName: string, channelId: string) => {
//     const name = window.prompt("Enter server name (e.g., Server 4):");
//     if (!name) return;
//     const rawUrl = window.prompt("Enter iframe source URL (e.g., https://dlstreams...):");
//     if (!rawUrl) return;
    
//     const url = extractUrl(rawUrl);
//     const serverId = `${channelId}-s${Date.now()}`;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: [...ch.servers, { id: serverId, name, url }] };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const editServer = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
//     const newName = window.prompt("Edit server name:", oldName);
//     if (!newName) return;
//     const rawUrl = window.prompt("Edit iframe source URL:", oldUrl);
//     if (!rawUrl) return;

//     const newUrl = extractUrl(rawUrl);

//     if (newName === oldName && newUrl === oldUrl) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return {
//                       ...ch,
//                       servers: ch.servers.map(s => s.id === serverId ? { ...s, name: newName, url: newUrl } : s)
//                     };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
//     if (!window.confirm("Are you sure you want to delete this server?")) return;

//     const newData = websitesData.map(ws => {
//       if (ws.id === websiteId) {
//         return {
//           ...ws,
//           categories: ws.categories.map(c => {
//             if (c.name === categoryName) {
//               return {
//                 ...c,
//                 channels: c.channels.map(ch => {
//                   if (ch.id === channelId) {
//                     return { ...ch, servers: ch.servers.filter(s => s.id !== serverId) };
//                   }
//                   return ch;
//                 })
//               };
//             }
//             return c;
//           })
//         };
//       }
//       return ws;
//     });
//     saveData(newData);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
//       <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
//             Live Sports
//           </h1>
//           <p className="mt-4 text-gray-400 text-lg">
//             Select a channel to view available servers.
//           </p>
//         </div>
//         <button
//           onClick={() => setIsEditMode(!isEditMode)}
//           className={`px-6 py-3 rounded-full font-bold transition-all ${
//             isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//           }`}
//         >
//           {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
//         </button>
//       </header>

//       <main className="space-y-16">
//         {websitesData.map((website) => (
//           <section key={website.id} className="space-y-8">
//             <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
//               {website.name}
//             </h2>

//             {website.categories.map((category) => (
//               <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-400">
//                     {category.name}
//                   </h3>
//                   {isEditMode && (
//                     <div className="flex gap-2">
//                       <button onClick={() => addChannel(website.id, category.name)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Channel</button>
//                       <button onClick={() => editCategory(website.id, category.name)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white font-medium">Edit Sport</button>
//                       <button onClick={() => deleteCategory(website.id, category.name)} className="text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-red-200 font-medium">Delete Sport</button>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {category.channels.map((channel) => (
//                     <div key={channel.id} className="flex flex-col gap-2 relative">
//                       {/* Channel Card */}
//                       <div
//                         onClick={() => toggleChannel(channel.id)}
//                         className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] transition-all duration-300 w-full min-h-[8rem] ${!isEditMode ? "cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-white/10" : "opacity-80"}`}
//                       >
//                         <div className={`h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 transition-colors duration-300 ${!isEditMode ? "group-hover:bg-black/60" : ""}`}>
//                           <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${!isEditMode ? "group-hover:scale-110" : ""}`}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
//                               <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
//                             </svg>
//                           </div>
//                           <span className="text-lg font-semibold text-white text-center">
//                             {channel.name}
//                           </span>
//                         </div>
//                       </div>

//                       {isEditMode && (
//                         <div className="absolute -top-2 -right-2 flex gap-1 z-10">
//                           <button 
//                             onClick={() => editChannel(website.id, category.name, channel.id, channel.name)}
//                             className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg"
//                             title="Edit Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                           </button>
//                           <button 
//                             onClick={() => deleteChannel(website.id, category.name, channel.id)}
//                             className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg"
//                             title="Delete Channel"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
//                           </button>
//                         </div>
//                       )}

//                       {/* Servers Dropdown / List (Always expanded in Edit Mode) */}
//                       {(expandedChannelId === channel.id || isEditMode) && (
//                         <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
//                           {channel.servers.map((server) => (
//                             <div key={server.id} className="flex gap-2">
//                               {isEditMode ? (
//                                 <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
//                                   <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
//                                 </div>
//                               ) : (
//                                 <Link
//                                   href={`/channel/${server.id}`}
//                                   className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
//                                 >
//                                   <span className="text-gray-300 font-medium">{server.name}</span>
//                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
//                                 </Link>
//                               )}
                              
//                               {isEditMode && (
//                                 <>
//                                   <button 
//                                     onClick={() => editServer(website.id, category.name, channel.id, server.id, server.name, server.url)}
//                                     className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700"
//                                     title="Edit Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
//                                   </button>
//                                   <button 
//                                     onClick={() => deleteServer(website.id, category.name, channel.id, server.id)}
//                                     className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50"
//                                     title="Delete Server"
//                                   >
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           ))}
                          
//                           {isEditMode && (
//                             <button
//                               onClick={() => addServer(website.id, category.name, channel.id)}
//                               className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1"
//                             >
//                               + Add Server
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {isEditMode && category.channels.length === 0 && (
//                     <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-gray-700 text-gray-500">
//                       No channels yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isEditMode && (
//               <button
//                 onClick={() => addCategory(website.id)}
//                 className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg"
//               >
//                 + Add Sport Category
//               </button>
//             )}
//           </section>
//         ))}
//       </main>
//     </div>
//   );
// }
