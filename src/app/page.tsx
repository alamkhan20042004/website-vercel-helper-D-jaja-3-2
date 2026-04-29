"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Website, Category, Channel, Server } from "@/lib/data";

export default function Home() {
  const [websitesData, setWebsitesData] = useState<Website[]>([]);
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (isEditMode) return; // Prevent toggling while editing to avoid accidental clicks
    setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
  };

  // --- CRUD Functions ---

  const addCategory = (websiteId: string) => {
    const name = window.prompt("Enter new category name (e.g., Baseball):");
    if (!name) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return { ...ws, categories: [...ws.categories, { name, channels: [] }] };
      }
      return ws;
    });
    saveData(newData);
  };

  const editCategory = (websiteId: string, oldName: string) => {
    const newName = window.prompt("Edit category name:", oldName);
    if (!newName || newName === oldName) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => c.name === oldName ? { ...c, name: newName } : c)
        };
      }
      return ws;
    });
    saveData(newData);
  };

  const deleteCategory = (websiteId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete category '${categoryName}'?`)) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return { ...ws, categories: ws.categories.filter(c => c.name !== categoryName) };
      }
      return ws;
    });
    saveData(newData);
  };

  const addChannel = (websiteId: string, categoryName: string) => {
    const name = window.prompt("Enter new channel name (e.g., Star Sports):");
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const color = "from-gray-800 to-gray-600"; // default color

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return { ...c, channels: [...c.channels, { id, name, color, servers: [] }] };
            }
            return c;
          })
        };
      }
      return ws;
    });
    saveData(newData);
  };

  const editChannel = (websiteId: string, categoryName: string, channelId: string, oldName: string) => {
    const newName = window.prompt("Edit channel name:", oldName);
    if (!newName || newName === oldName) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return {
                ...c,
                channels: c.channels.map(ch => ch.id === channelId ? { ...ch, name: newName } : ch)
              };
            }
            return c;
          })
        };
      }
      return ws;
    });
    saveData(newData);
  };

  const deleteChannel = (websiteId: string, categoryName: string, channelId: string) => {
    if (!window.confirm("Are you sure you want to delete this channel?")) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return { ...c, channels: c.channels.filter(ch => ch.id !== channelId) };
            }
            return c;
          })
        };
      }
      return ws;
    });
    saveData(newData);
  };

  // Utility to extract URL if the user pastes a full iframe tag
  const extractUrl = (input: string) => {
    const match = input.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : input.trim();
  };

  const addServer = (websiteId: string, categoryName: string, channelId: string) => {
    const name = window.prompt("Enter server name (e.g., Server 4):");
    if (!name) return;
    const rawUrl = window.prompt("Enter iframe source URL (e.g., https://dlstreams...):");
    if (!rawUrl) return;
    
    const url = extractUrl(rawUrl);
    const serverId = `${channelId}-s${Date.now()}`;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return {
                ...c,
                channels: c.channels.map(ch => {
                  if (ch.id === channelId) {
                    return { ...ch, servers: [...ch.servers, { id: serverId, name, url }] };
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
  };

  const editServer = (websiteId: string, categoryName: string, channelId: string, serverId: string, oldName: string, oldUrl: string) => {
    const newName = window.prompt("Edit server name:", oldName);
    if (!newName) return;
    const rawUrl = window.prompt("Edit iframe source URL:", oldUrl);
    if (!rawUrl) return;

    const newUrl = extractUrl(rawUrl);

    if (newName === oldName && newUrl === oldUrl) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return {
                ...c,
                channels: c.channels.map(ch => {
                  if (ch.id === channelId) {
                    return {
                      ...ch,
                      servers: ch.servers.map(s => s.id === serverId ? { ...s, name: newName, url: newUrl } : s)
                    };
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
  };

  const deleteServer = (websiteId: string, categoryName: string, channelId: string, serverId: string) => {
    if (!window.confirm("Are you sure you want to delete this server?")) return;

    const newData = websitesData.map(ws => {
      if (ws.id === websiteId) {
        return {
          ...ws,
          categories: ws.categories.map(c => {
            if (c.name === categoryName) {
              return {
                ...c,
                channels: c.channels.map(ch => {
                  if (ch.id === channelId) {
                    return { ...ch, servers: ch.servers.filter(s => s.id !== serverId) };
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
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white p-12 text-center text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
            Live Sports
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Select a channel to view available servers.
          </p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            isEditMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
        </button>
      </header>

      <main className="space-y-16">
        {websitesData.map((website) => (
          <section key={website.id} className="space-y-8">
            <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
              {website.name}
            </h2>

            {website.categories.map((category) => (
              <div key={category.name} className="space-y-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-400">
                    {category.name}
                  </h3>
                  {isEditMode && website.id !== "daddylivehd" && (
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
                      {/* Channel Card */}
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
                          <span className="text-lg font-semibold text-white text-center">
                            {channel.name}
                          </span>
                        </div>
                      </div>

                      {isEditMode && website.id !== "daddylivehd" && (
                        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                          <button 
                            onClick={() => editChannel(website.id, category.name, channel.id, channel.name)}
                            className="bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 shadow-lg"
                            title="Edit Channel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                          </button>
                          <button 
                            onClick={() => deleteChannel(website.id, category.name, channel.id)}
                            className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg"
                            title="Delete Channel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}

                      {/* Servers Dropdown / List (Always expanded in Edit Mode) */}
                      {(expandedChannelId === channel.id || isEditMode) && (
                        <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                          {channel.servers.map((server) => (
                            <div key={server.id} className="flex gap-2">
                              {isEditMode ? (
                                <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-70">
                                  <span className="text-gray-400 font-medium truncate" title={server.url}>{server.name}</span>
                                </div>
                              ) : (
                                <Link
                                  href={`/channel/${server.id}`}
                                  className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
                                >
                                  <span className="text-gray-300 font-medium">{server.name}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                                </Link>
                              )}
                              
                              {isEditMode && website.id !== "daddylivehd" && (
                                <>
                                  <button 
                                    onClick={() => editServer(website.id, category.name, channel.id, server.id, server.name, server.url)}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg transition-colors border border-gray-700"
                                    title="Edit Server"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                  </button>
                                  <button 
                                    onClick={() => deleteServer(website.id, category.name, channel.id, server.id)}
                                    className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 rounded-lg transition-colors border border-red-900/50"
                                    title="Delete Server"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                          
                          {isEditMode && website.id !== "daddylivehd" && (
                            <button
                              onClick={() => addServer(website.id, category.name, channel.id)}
                              className="w-full flex items-center justify-center p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 text-green-400 transition-colors font-medium border-dashed mt-1"
                            >
                              + Add Server
                            </button>
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

            {isEditMode && website.id !== "daddylivehd" && (
              <button
                onClick={() => addCategory(website.id)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-bold text-lg"
              >
                + Add Sport Category
              </button>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
