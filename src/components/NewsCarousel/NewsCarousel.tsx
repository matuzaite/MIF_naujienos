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

  // outerRefs — wrapper su overflow:hidden (matavimui)
  // innerRefs — vidinis div, kurio transform judina turinį
  // Tizen 4 / Chromium 56: scrollTop ir scrollTo() neveikia — naudojame translateY
  const outerRefs = useRef<{ [idx: number]: HTMLDivElement | null }>({});
  const innerRefs = useRef<{ [idx: number]: HTMLDivElement | null }>({});
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollDelayRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPosRef = useRef<number>(0);

  // Fono naujienos atnaujinimas kas 30 min per XHR (Tizen suderinamas)
  useEffect(() => {
    const fetchLatestNews = () => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://193.219.91.103:11857/api/news?t=' + new Date().getTime(), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var freshData = JSON.parse(xhr.responseText);
            if (freshData && freshData.length > 0) {
              setItems(freshData);
              setCurrentIndex(function (prev) { return prev >= freshData.length ? 0 : prev; });
            }
          } catch (e) {
            console.error('Klaida gaunant naujienas:', e);
          }
        }
      };
      xhr.send();
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

  useEffect(() => {
    if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    if (autoScrollDelayRef.current) clearTimeout(autoScrollDelayRef.current);

    // RAF — laukiam kol Tizen DOM apsistato po slaidų keitimo
    requestAnimationFrame(() => {
      const inner = innerRefs.current[currentIndex];
      if (!inner) return;

      // Grąžinam į viršų per CSS transform (ne scrollTop — Chromium 56 neveikia)
      scrollPosRef.current = 0;
      inner.style.webkitTransform = 'translateY(0px)';
      inner.style.transform = 'translateY(0px)';

      autoScrollDelayRef.current = setTimeout(() => {
        autoScrollTimerRef.current = setInterval(() => {
          const outer = outerRefs.current[currentIndex];
          const inn = innerRefs.current[currentIndex];
          if (!outer || !inn) return;

          const maxScroll = inn.offsetHeight - outer.clientHeight;
          if (maxScroll <= 2 || scrollPosRef.current >= maxScroll - 2) {
            if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
            return;
          }

          scrollPosRef.current = Math.min(scrollPosRef.current + 1, maxScroll);
          var t = 'translateY(-' + scrollPosRef.current + 'px)';
          inn.style.webkitTransform = t;
          inn.style.transform = t;
        }, 80);
      }, 3000);
    });

    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
      if (autoScrollDelayRef.current) clearTimeout(autoScrollDelayRef.current);
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
                  ref={(el) => { outerRefs.current[idx] = el; }}
                  className={styles.articleBody}
                >
                  <div
                    ref={(el) => { innerRefs.current[idx] = el; }}
                    className={styles.articleBodyInner}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
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