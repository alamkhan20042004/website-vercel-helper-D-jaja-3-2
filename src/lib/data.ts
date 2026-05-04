import { kv } from '@vercel/kv';

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

export async function getWebsitesData(): Promise<Website[]> {
  try {
    // Vercel KV se data nikalein
    const data = await kv.get<Website[]>('websites_data');
    return data || []; // Agar database bilkul naya/empty hai toh empty array return hoga
  } catch (error) {
    console.error('Error reading websites data from KV:', error);
    return [];
  }
}

export async function getServerUrlById(serverId: string): Promise<string | null> {
  const websitesData = await getWebsitesData();
  
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

















// import fs from 'fs/promises';
// import path from 'path';

// export interface Server {
//   id: string;
//   name: string;
//   url: string;
// }

// export interface Channel {
//   id: string;
//   name: string;
//   color: string;
//   servers: Server[];
// }

// export interface Category {
//   name: string;
//   channels: Channel[];
// }

// export interface Website {
//   id: string;
//   name: string;
//   categories: Category[];
// }

// export async function getWebsitesData(): Promise<Website[]> {
//   try {
//     const dataPath = path.join(process.cwd(), 'data', 'websites.json');
//     const fileContents = await fs.readFile(dataPath, 'utf8');
//     return JSON.parse(fileContents);
//   } catch (error) {
//     console.error('Error reading websites data:', error);
//     return [];
//   }
// }

// export async function getServerUrlById(serverId: string): Promise<string | null> {
//   const websitesData = await getWebsitesData();
  
//   for (const website of websitesData) {
//     for (const category of website.categories) {
//       for (const channel of category.channels) {
//         for (const server of channel.servers) {
//           if (server.id === serverId) {
//             return server.url;
//           }
//         }
//       }
//     }
//   }
//   return null;
// }
