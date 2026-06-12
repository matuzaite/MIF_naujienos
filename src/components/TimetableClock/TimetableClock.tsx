'use client';
import { useState, useEffect } from 'react';

export default function TimetableClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const t = now.toLocaleTimeString('lt-LT', {
        timeZone: 'Europe/Vilnius',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTime(t);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => window.location.reload(), 60000);
    return () => clearTimeout(id);
  }, []);

  return <span>{time}</span>;
}
