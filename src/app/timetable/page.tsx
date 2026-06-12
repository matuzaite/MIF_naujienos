import { fetchTimetable } from '@/lib/timetable';
import TimetableClock from '@/components/TimetableClock/TimetableClock';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th className={styles.firstHeader} colSpan={4}>Vykstančios paskaitos</th></tr>
                <tr>
                  <th className={`${styles.subHeader} ${styles.center}`}>Laikas</th>
                  <th className={styles.subHeader}>Dalykas<br />Dėstytojai</th>
                  <th className={styles.subHeader}>Grupės</th>
                  <th className={`${styles.subHeader} ${styles.center}`}>Auditorija</th>
                </tr>
              </thead>
              <tbody dangerouslySetInnerHTML={{
                __html: data.currentHtml || '<tr><td colspan="4" class="text-center">Paskaitų nėra</td></tr>'
              }} />
            </table>
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th className={styles.firstHeader} colSpan={4}>Artėjančios paskaitos</th></tr>
                <tr>
                  <th className={`${styles.subHeader} ${styles.center}`}>Laikas</th>
                  <th className={styles.subHeader}>Dalykas<br />Dėstytojai</th>
                  <th className={styles.subHeader}>Grupės</th>
                  <th className={`${styles.subHeader} ${styles.center}`}>Auditorija</th>
                </tr>
              </thead>
              <tbody dangerouslySetInnerHTML={{
                __html: data.upcomingHtml || '<tr><td colspan="4" class="text-center">Paskaitų nėra</td></tr>'
              }} />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
