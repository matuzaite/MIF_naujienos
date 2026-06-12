'use client';
import { useState, useEffect } from 'react';
import styles from './TimetableView.module.css';
import { TimetableData } from '@/lib/timetable';

function TimetableTable({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  return (
    <div className={styles.tableWrapper}>
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
        <tbody dangerouslySetInnerHTML={{
          __html: bodyHtml || '<tr><td colspan="4" class="text-center">Paskaitų nėra</td></tr>'
        }} />
      </table>
    </div>
  );
}

export default function TimetableView() {
  const [data, setData] = useState<TimetableData>({ currentHtml: '', upcomingHtml: '' });
  const [time, setTime] = useState('');

  useEffect(() => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/timetable?t=' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try { setData(JSON.parse(xhr.responseText)); } catch {}
      }
    };
    xhr.send();
  }, []);

  useEffect(() => {
    var tick = function () {
      setTime(new Date().toLocaleTimeString('lt-LT', {
        timeZone: 'Europe/Vilnius',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };
    tick();
    var id = setInterval(tick, 500);
    return function () { clearInterval(id); };
  }, []);

  var today = new Date().toLocaleDateString('lt-LT', {
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
          <TimetableTable title="Vykstančios paskaitos" bodyHtml={data.currentHtml} />
        </div>
        <div className={styles.column}>
          <TimetableTable title="Artėjančios paskaitos" bodyHtml={data.upcomingHtml} />
        </div>
      </div>
    </div>
  );
}
