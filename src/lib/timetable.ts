import { parse } from 'node-html-parser';

export interface TimetableEntry {
  time: string;
  subjectLt: string;
  subjectEn: string;
  instructors: string;
  groups: string;
  rooms: string;
}

export interface TimetableData {
  current: TimetableEntry[];
  upcoming: TimetableEntry[];
}

function parseEntry(row: any): TimetableEntry | null {
  const cells = row.querySelectorAll('td');
  if (cells.length < 4) return null;

  const time = cells[0].text.trim();

  const subjectCell = cells[1];
  const strongs = subjectCell.querySelectorAll('strong');
  const subjectLt = strongs[0]?.text.trim() ?? '';
  const subjectEn = strongs[1]?.text.trim() ?? '';

  const subjectHtml = subjectCell.innerHTML;
  const lastBr = subjectHtml.lastIndexOf('<br>');
  const afterBr = lastBr >= 0 ? subjectHtml.slice(lastBr + 4) : '';
  const instructors = parse(afterBr).text.trim();

  const groups = cells[2].text.trim();

  const rooms = cells[3].innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .join(' · ');

  return { time, subjectLt, subjectEn, instructors, groups, rooms };
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

    const parseSection = (colId: string): TimetableEntry[] =>
      (root.querySelector(`#${colId} tbody`)?.querySelectorAll('tr') ?? [])
        .map(parseEntry)
        .filter((e): e is TimetableEntry => e !== null);

    return {
      current: parseSection('first-col'),
      upcoming: parseSection('second-col'),
    };
  } catch (e) {
    console.error('Timetable fetch error:', e);
    return { current: [], upcoming: [] };
  }
}
