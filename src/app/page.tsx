"use client";

import { useState } from "react";
import Link from "next/link";
import { websitesData } from "@/lib/data";

export default function Home() {
  // Track which channel is currently expanded to show servers
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);

  const toggleChannel = (channelId: string) => {
    setExpandedChannelId(expandedChannelId === channelId ? null : channelId);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
          Live Sports
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          Select a channel to view available servers.
        </p>
      </header>

      <main className="space-y-16">
        {websitesData.map((website) => (
          <section key={website.id} className="space-y-8">
            <h2 className="text-3xl font-bold text-white border-b border-gray-800 pb-4">
              {website.name}
            </h2>

            {website.categories.map((category) => (
              <div key={category.name} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-400">
                  {category.name}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.channels.map((channel) => (
                    <div key={channel.id} className="flex flex-col gap-2">
                      {/* Channel Button */}
                      <button
                        onClick={() => toggleChannel(channel.id)}
                        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10 text-left w-full h-32`}
                      >
                        <div className="h-full w-full bg-black/80 rounded-xl p-4 flex flex-col justify-center items-center gap-3 group-hover:bg-black/60 transition-colors duration-300">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-6 h-6 text-white/80"
                            >
                              <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold text-white group-hover:text-white/90 text-center">
                            {channel.name}
                          </span>
                        </div>
                      </button>

                      {/* Servers Dropdown / List */}
                      {expandedChannelId === channel.id && (
                        <div className="flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {channel.servers.map((server) => (
                            <Link
                              key={server.id}
                              href={`/channel/${server.id}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-all duration-200"
                            >
                              <span className="text-gray-300 font-medium">
                                {server.name}
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5 text-gray-500"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
