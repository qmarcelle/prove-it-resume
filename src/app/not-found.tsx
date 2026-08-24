import Link from 'next/link';
import { SITE } from '@/content/site';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.main}>
      <p className={styles.code}>404</p>
      <h1 className={styles.heading}>No evidence at this address.</h1>
      <p className={styles.body}>
        The page you asked for does not exist. The evidence surface itself is one page.
      </p>
      <Link className={styles.link} href="/">
        Go to the proof →
      </Link>
      <span className={styles.meta}>
        {SITE.wordmark} {SITE.wordmarkSuffix}
      </span>
    </main>
  );
}
