import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import { join } from 'path';

export async function GET() {
  try {
    const readmePath = join(process.cwd(), 'README.md');
    const content = readFileSync(readmePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read README' },
      { status: 500 }
    );
  }
}
