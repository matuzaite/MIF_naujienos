import { fetchTimetable, TimetableEntry } from '@/lib/timetable';
import TimetableClock from '@/components/TimetableClock/TimetableClock';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function TimetableTable({ title, entries }: { title: string; entries: TimetableEntry[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.firstHeader} colSpan={4}>{title}</th>
        </tr>
        <tr>
          <th className={`${styles.subHeader} ${styles.center}`}>Laikas</th>
          <th className={styles.subHeader}>Dalykas<br />Dėstytojai</th>
          <th className={styles.subHeader}>Grupės</th>
          <th className={`${styles.subHeader} ${styles.center}`}>Auditorija</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr>
            <td colSpan={4} className={`${styles.td} ${styles.center}`}>Paskaitų nėra</td>
          </tr>
        ) : entries.map((entry, i) => (
          <tr key={i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
            <td className={`${styles.td} ${styles.center} ${styles.nowrap}`}>{entry.time}</td>
            <td className={`${styles.td} ${styles.subjectCell}`}>
              <strong className={styles.subjectLt}>{entry.subjectLt}</strong>
              {entry.subjectEn && (
                <><br /><strong className={styles.subjectEn}>{entry.subjectEn}</strong></>
              )}
              {entry.instructors && (
                <><br /><span>{entry.instructors}</span></>
              )}
            </td>
            <td className={`${styles.td} ${styles.groupCell}`}>{entry.groups}</td>
            <td className={`${styles.td} ${styles.center}`}>{entry.rooms}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function TimetablePage() {
  const data = await fetchTimetable();

  const today = new Date().toLocaleDateString('lt-LT', {
    timeZone: 'Europe/Vilnius',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <strong className={styles.pageHeader}>MIF – Didlaukio g. 47</strong>
        <strong className={styles.pageHeader}>
          {today}, <TimetableClock />
        </strong>
      </div>
      <div className={styles.body}>
        <div className={styles.column}>
          <TimetableTable title="Vykstančios paskaitos" entries={data.current} />
        </div>
        <div className={styles.column}>
          <TimetableTable title="Artėjančios paskaitos" entries={data.upcoming} />
        </div>
      </div>
    </div>
  );
}
