import Head from "next/head";
import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./AuthCard.module.css";

export default function AuthCard({
  pageTitle,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <>
      <Head>
        <title>{`${pageTitle} · Bloomy`}</title>
      </Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <FlowerIcon size={40} color="var(--color-primary)" />
            <h1 className={styles.brand}>Bloomy</h1>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {children}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </>
  );
}
