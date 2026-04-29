export interface Server {
  id: string;
  name: string;
  url: string;
}

export interface Channel {
  id: string;
  name: string;
  color: string;
  servers: Server[];
}

export interface Category {
  name: string;
  channels: Channel[];
}

export interface Website {
  id: string;
  name: string;
  categories: Category[];
}

export const websitesData: Website[] = [
  {
    id: "daddylivehd",
    name: "DaddyLiveHD (dlstream.com)",
    categories: [
      {
        name: "Cricket",
        channels: [
          {
            id: "willow-2",
            name: "Willow 2",
            color: "from-blue-900 to-blue-600",
            servers: [
              { id: "willow2-s1", name: "Server 1", url: "https://dlstreams.com/stream/stream-598.php" },
              { id: "willow2-s2", name: "Server 2", url: "https://dlstreams.com/watch/stream-598.php" },
              { id: "willow2-s3", name: "Server 3", url: "https://dlstreams.com/plus/stream-598.php" },
            ],
          },
          {
            id: "sky-sports-cricket",
            name: "Sky Sports Cricket",
            color: "from-indigo-900 to-indigo-600",
            servers: [
              { id: "ssc-s1", name: "Server 1", url: "https://example.com/stream/ssc" },
            ],
          },
        ],
      },
      {
        name: "Football",
        channels: [
          {
            id: "sky-sports-football",
            name: "Sky Sports Football",
            color: "from-red-800 to-red-500",
            servers: [
              { id: "ssf-s1", name: "Server 1", url: "https://example.com/stream/ssf" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "embedsports",
    name: "EmbedSports",
    categories: [
      {
        name: "Cricket",
        channels: [
          {
            id: "willow-sports",
            name: "Willow Sports",
            color: "from-blue-800 to-cyan-600",
            servers: [
              { id: "willow-embed-1", name: "Server 1", url: "https://embedsports.top/embed/admin/admin-willow-cricket/2" },
            ],
          },
        ],
      },
    ],
  },
];

export function getServerUrlById(serverId: string): string | null {
  for (const website of websitesData) {
    for (const category of website.categories) {
      for (const channel of category.channels) {
        for (const server of channel.servers) {
          if (server.id === serverId) {
            return server.url;
          }
        }
      }
    }
  }
  return null;
}
