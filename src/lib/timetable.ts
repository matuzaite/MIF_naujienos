import { parse } from 'node-html-parser';

export interface TimetableData {
  currentHtml: string;
  upcomingHtml: string;
}

export async function fetchTimetable(): Promise<TimetableData> {
  try {
    const res = await fetch('https://tvarkarasciai.vu.lt/mif-i/lectures/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    const html = await res.text();
    const root = parse(html);
    return {
      currentHtml: root.querySelector('#first-col tbody')?.innerHTML ?? '',
      upcomingHtml: root.querySelector('#second-col tbody')?.innerHTML ?? '',
    };
  } catch (e) {
    console.error('Timetable fetch error:', e);
    return { currentHtml: '', upcomingHtml: '' };
  }
}
