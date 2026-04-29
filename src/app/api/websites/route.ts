import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'websites.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading websites data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    await fs.writeFile(dataPath, JSON.stringify(newData, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving websites data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
