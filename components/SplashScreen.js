import { useEffect, useState } from "react";
import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./SplashScreen.module.css";

const VISIBLE_DURATION_IN_MILLISECONDS = 1600;
const FADE_DURATION_IN_MILLISECONDS = 400;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!isStandalone()) return;

    setVisible(true);

    const leaveTimeout = setTimeout(
      () => setLeaving(true),
      VISIBLE_DURATION_IN_MILLISECONDS,
    );
    const hideTimeout = setTimeout(
      () => setVisible(false),
      VISIBLE_DURATION_IN_MILLISECONDS + FADE_DURATION_IN_MILLISECONDS,
    );

    return () => {
      clearTimeout(leaveTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${leaving ? styles.leaving : ""}`}>
      <div className={styles.flower}>
        <FlowerIcon size={96} color="var(--color-primary)" />
      </div>
      <p className={styles.brand}>Bloomy</p>
    </div>
  );
}
