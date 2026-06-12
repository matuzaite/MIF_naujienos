import Image from 'next/image';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Image
          src="/VU_MIF_herbai.png"
          alt="VU MIF"
          width={300}
          height={300}
          className={styles.logo}
          priority
        />
      </div>
      <div className={styles.qrContainer}>
        <Image
          src="/VU_MIF_social_qr.png"
          alt="VU MIF socialiniai tinklai"
          width={300}
          height={300}
          className={styles.qr}
        />
      </div>
    </aside>
  );
}
