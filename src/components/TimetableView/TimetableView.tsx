'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './TimetableView.module.css';
import { TimetableEntry, TimetableData } from '@/lib/timetable';

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

export default function TimetableView() {
  const [data, setData] = useState<TimetableData>({ current: [], upcoming: [] });
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/timetable?t=${Date.now()}`);
        const json = await res.json();
        setData(json);
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('lt-LT', {
        timeZone: 'Europe/Vilnius',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const today = new Date().toLocaleDateString('lt-LT', {
    timeZone: 'Europe/Vilnius',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <strong className={styles.pageHeader}>MIF – Didlaukio g. 47</strong>
        <strong className={styles.pageHeader}>{today}, {time}</strong>
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
