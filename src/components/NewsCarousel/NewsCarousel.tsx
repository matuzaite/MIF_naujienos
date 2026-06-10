'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './NewsCarousel.module.scss';

interface NewsCarouselProps {
  initialItems: any[];
}

export default function NewsCarousel({ initialItems }: NewsCarouselProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fono naujienos atnaujinimas kas 30 min per XHR (Tizen suderinamas)
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const res = await fetch(`/api/news?t=${new Date().getTime()}&r=${Math.random()}`);
        const freshData = await res.json();
        if (freshData && freshData.length > 0) {
          setItems(freshData);
          setCurrentIndex(function (prev) { return prev >= freshData.length ? 0 : prev; });
        }
      } catch (e) {
        console.error('Klaida gaunant naujienas:', e);
      }
    };

    fetchLatestNews();
    var updateInterval = setInterval(fetchLatestNews, 1800000);
    return function () { clearInterval(updateInterval); };
  }, []);

  // Automatinis slaidų keitimas kas 30 sek
  const startAutoRotation = () => {
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % itemsRef.current.length);
    }, 30000);
  };

  useEffect(() => {
    if (items.length === 0) return;
    startAutoRotation();
    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    startAutoRotation();
  };

  // Reset scroll position when slide changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      scrollPosRef.current = 0;
    }
  }, [currentIndex]);

  // RAF scroll engine — reads dimensions each frame for S6 (Tizen 3) compat
  useEffect(() => {
    let animationFrameId: number = 0;
    let started = false;

    const delayTimeout = setTimeout(() => {
      const scrollAnimation = () => {
        if (scrollRef.current && !isPausedRef.current) {
          const scrollHeight = scrollRef.current.scrollHeight;
          const clientHeight = scrollRef.current.clientHeight;
          if (scrollHeight > clientHeight && scrollPosRef.current + clientHeight < scrollHeight - 2) {
            scrollPosRef.current += 0.5;
            scrollRef.current.scrollTop = Math.floor(scrollPosRef.current);
          }
        }
        animationFrameId = requestAnimationFrame(scrollAnimation);
      };

      animationFrameId = requestAnimationFrame(scrollAnimation);
      started = true;
    }, 2000);

    return () => {
      clearTimeout(delayTimeout);
      if (started && animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex]);

  // Naktinis perkrovimas 3:00 atminčiai išvalyti
  useEffect(() => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (now.getHours() >= 3 ? 1 : 0),
      3, 0, 0
    );
    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, night.getTime() - now.getTime());
    return () => clearTimeout(reloadTimeout);
  }, []);

  if (items.length === 0) return <div className={styles.loading}>Naujienų nerasta</div>;

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.newsContainer}>
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={idx}
              className={`${styles.slide} ${isActive ? styles.activeSlide : styles.inactiveSlide}`}
            >
              <div className={styles.leftColumn}>
                <h2 className={styles.headline}>{item.title}</h2>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.dateLabel}>
                  {item.category} | {item.date}
                </div>
                <div
                  ref={isActive ? scrollRef : null}
                  className={styles.articleBody}
                >
                  <div dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
              </div>
            </div>
          );
        })}

        <div className={styles.progressContainer}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : styles.inactiveDot}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}