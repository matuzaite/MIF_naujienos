'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import NewsCarousel from '@/components/NewsCarousel/NewsCarousel';
import TimetableView from '@/components/TimetableView/TimetableView';
import styles from './RotatingDisplay.module.css';

const NEWS_MS = 2 * 60 * 1000;      // 2 minutes
const TIMETABLE_MS = 1 * 60 * 1000; // 1 minute

export default function RotatingDisplay({ initialNews }: { initialNews: any[] }) {
  const [showTimetable, setShowTimetable] = useState(false);

  useEffect(() => {
    let id: NodeJS.Timeout;
    const schedule = (timetable: boolean) => {
      id = setTimeout(() => {
        const next = !timetable;
        setShowTimetable(next);
        schedule(next);
      }, timetable ? TIMETABLE_MS : NEWS_MS);
    };
    schedule(false);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <Sidebar />
      <div className={styles.contentArea}>
        <NewsCarousel initialItems={initialNews} />
      </div>
      {showTimetable && <TimetableView />}
    </>
  );
}
