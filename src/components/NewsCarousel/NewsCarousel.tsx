'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './NewsCarousel.module.scss';

interface NewsCarouselProps {
  initialItems: any[];
}

export default function NewsCarousel({ initialItems }: NewsCarouselProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRotateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef(items);
  const scrollPosRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Background news refresh every 30 minutes
  useEffect(() => {
    const fetchLatestNews = () => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/news?t=' + new Date().getTime() + '&r=' + Math.random(), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var freshData = JSON.parse(xhr.responseText);
            if (freshData && freshData.length > 0) {
              setItems(freshData);
              setCurrentIndex(function (prev) { return prev >= freshData.length ? 0 : prev; });
            }
          } catch (e) {}
        }
      };
      xhr.send();
    };
    fetchLatestNews();
    var id = setInterval(fetchLatestNews, 1800000);
    return function () { clearInterval(id); };
  }, []);

  // Slide auto-rotation — uses itemsRef to avoid stale closure on old Chromium
  const startAutoRotation = function () {
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setInterval(function () {
      setCurrentIndex(function (prev) { return (prev + 1) % itemsRef.current.length; });
    }, 30000);
  };

  useEffect(() => {
    if (items.length === 0) return;
    startAutoRotation();
    return function () {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [items.length]);

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    startAutoRotation();
  };

  // Reset scroll when slide changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      scrollPosRef.current = 0;
    }
  }, [currentIndex]);

  // RAF scroll engine for older TVs
  useEffect(() => {
    var animationFrameId = 0;

    var launchEngine = function () {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
      if (!scrollRef.current) return;

      var scrollHeight = scrollRef.current.scrollHeight;
      var clientHeight = scrollRef.current.clientHeight;
      if (scrollHeight <= clientHeight) return;

      var scrollAnimation = function () {
        if (scrollRef.current && !isPausedRef.current) {
          if (scrollPosRef.current + clientHeight < scrollHeight - 2) {
            scrollPosRef.current += 0.5;
            var newScrollTop = Math.floor(scrollPosRef.current);
            if (scrollRef.current.scrollTop !== newScrollTop) {
              scrollRef.current.scrollTop = newScrollTop;
            }
          }
        }
        animationFrameId = requestAnimationFrame(scrollAnimation);
      };
      animationFrameId = requestAnimationFrame(scrollAnimation);
    };

    var delayTimeout = setTimeout(launchEngine, 2000);

    var imgListenerTimeout = setTimeout(function () {
      if (!scrollRef.current) return;
      scrollRef.current.querySelectorAll('img').forEach(function (img: HTMLImageElement) {
        if (!img.complete) {
          var handler = function () {
            img.removeEventListener('load', handler);
            setTimeout(launchEngine, 200);
          };
          img.addEventListener('load', handler);
        }
      });
    }, 500);

    return function () {
      clearTimeout(delayTimeout);
      clearTimeout(imgListenerTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex]);

  // Daily hard reload at 3 AM to clear memory
  useEffect(() => {
    var now = new Date();
    var night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (now.getHours() >= 3 ? 1 : 0),
      3, 0, 0
    );
    var msToNight = night.getTime() - now.getTime();
    var reloadTimeout = setTimeout(function () { window.location.reload(); }, msToNight);
    return function () { clearTimeout(reloadTimeout); };
  }, []);

  if (items.length === 0) return <div className={styles.loading}>Naujienų nerasta</div>;

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.newsContainer}>
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          const isNext = idx === (currentIndex + 1) % items.length;
          if (!isActive && !isNext) return null;

          return (
            <div
              key={idx}
              className={`${styles.slide} ${isActive ? styles.activeSlide : styles.inactiveSlide}`}
            >
              <div className={styles.leftColumn}>
                <div className={styles.headlineContainer}>
                  <h2 className={styles.headline}>{item.title}</h2>
                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.dateLabel}>
                  {item.category} | {item.date}
                </div>
                <div
                  ref={isActive ? scrollRef : null}
                  className={styles.articleBody}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  tabIndex={0}
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
