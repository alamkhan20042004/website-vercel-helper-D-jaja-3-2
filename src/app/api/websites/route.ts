import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

// Yeh starter data hai jo khali hone par show hoga
const starterData = [
  {
    id: "site-1",
    name: "Main Sports Site",
    categories: [
      {
        name: "Sports Categories",
        channels: []
      }
    ]
  }
];

export async function GET() {
  try {
    // Agar KV database khali hai, toh starterData bhej do
    const data = await kv.get('websites_data') || starterData;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading websites data from KV:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    await kv.set('websites_data', newData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving websites data to KV:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}


















// import { NextResponse } from 'next/server';
// import fs from 'fs/promises';
// import path from 'path';

// export const dynamic = 'force-dynamic';

// const dataPath = path.join(process.cwd(), 'data', 'websites.json');

// export async function GET() {
//   try {
//     const fileContents = await fs.readFile(dataPath, 'utf8');
//     const data = JSON.parse(fileContents);
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error reading websites data:', error);
//     return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const newData = await request.json();
//     await fs.writeFile(dataPath, JSON.stringify(newData, null, 2), 'utf8');
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error saving websites data:', error);
//     return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
//   }
// }
