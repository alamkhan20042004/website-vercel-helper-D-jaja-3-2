import Link from "next/link";

const categories = [
  {
    name: "Cricket Channels",
    channels: [
      { id: "willow-sports", name: "Willow Sports", color: "from-blue-900 to-blue-600" },
      { id: "ten-sports", name: "Ten Sports", color: "from-red-900 to-red-600" },
      { id: "sky-sports-cricket", name: "Sky Sports Cricket", color: "from-indigo-900 to-indigo-600" },
      { id: "star-sports-1", name: "Star Sports 1", color: "from-blue-800 to-cyan-600" },
    ],
  },
  {
    name: "Football Channels",
    channels: [
      { id: "sky-sports-football", name: "Sky Sports Football", color: "from-red-800 to-red-500" },
      { id: "bt-sport-1", name: "BT Sport 1", color: "from-purple-900 to-purple-600" },
      { id: "beinsports", name: "beIN Sports", color: "from-purple-800 to-pink-600" },
      { id: "supersport-premier", name: "SuperSport Premier League", color: "from-blue-800 to-indigo-600" },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
          Live Sports
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          Select a channel to start streaming instantly.
        </p>
      </header>

      <main className="space-y-16">
        {categories.map((category) => (
          <section key={category.name}>
            <h2 className="text-2xl font-bold mb-6 text-gray-300 border-b border-gray-800 pb-2">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${channel.color} p-[1px] group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10`}
                >
                  <div className="h-full w-full bg-black/80 rounded-xl p-6 flex flex-col justify-center items-center text-center gap-4 group-hover:bg-black/60 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8 text-white/80"
                      >
                        <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-9.5 13V8l6 4-6 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
                      {channel.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
