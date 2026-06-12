'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './TimetableView.module.css';
import { TimetableData } from '@/lib/timetable';

function TimetableTable({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    var container = containerRef.current;
    if (!container) return;

    var animId = 0;
    var timerId = 0 as any;
    var stopped = false;

    function cleanup() {
      stopped = true;
      clearTimeout(timerId);
      if (animId) cancelAnimationFrame(animId);
    }

    // Wait for raw HTML to fully render before measuring
    timerId = setTimeout(function () {
      if (stopped || !container) return;

      var invisible = container.scrollHeight - container.clientHeight;
      if (invisible <= 0) return;

      var scroll_speed = 100; // px per second, matches original
      var delay_time = 5000; // 5s pause at top/bottom, matches original
      var scroll_time = Math.round(invisible / scroll_speed * 1000);

      function animateTo(target: number, duration: number, done: () => void) {
        var start = container!.scrollTop;
        var t0 = performance.now();
        function step(now: number) {
          if (stopped) return;
          var p = Math.min((now - t0) / duration, 1);
          container!.scrollTop = start + (target - start) * p;
          if (p < 1) {
            animId = requestAnimationFrame(step);
          } else {
            done();
          }
        }
        animId = requestAnimationFrame(step);
      }

      function cycle() {
        if (stopped) return;
        // Pause at top, then scroll down
        timerId = setTimeout(function () {
          if (stopped) return;
          animateTo(invisible, scroll_time, function () {
            // Pause at bottom, then scroll back up
            timerId = setTimeout(function () {
              if (stopped) return;
              animateTo(0, scroll_time, cycle);
            }, delay_time);
          });
        }, delay_time);
      }

      cycle();
    }, 1000);

    return cleanup;
  }, [bodyHtml]);

  return (
    <div ref={containerRef} className={styles.tableContainer}>
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
    </div>
  );
}

export default function TimetableView() {
  const [data, setData] = useState<TimetableData>({ currentHtml: '', upcomingHtml: '' });
  const [time, setTime] = useState('');

  useEffect(function () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/timetable?t=' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try { setData(JSON.parse(xhr.responseText)); } catch {}
      }
    };
    xhr.send();
  }, []);

  useEffect(function () {
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
