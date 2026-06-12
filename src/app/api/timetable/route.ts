import { NextResponse } from 'next/server';
import { fetchTimetable } from '@/lib/timetable';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchTimetable();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ currentHtml: '', upcomingHtml: '' });
  }
}
