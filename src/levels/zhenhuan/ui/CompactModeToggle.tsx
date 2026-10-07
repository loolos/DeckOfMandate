import { useSmallScreenToggle } from "../../../logic/useSmallScreen";
import styles from "./zhenhuan.module.css";

/** Same 略缩模式 preference as the Sun King campaign (off by default on every device). */
export function CompactModeToggle() {
  const [on, setOn] = useSmallScreenToggle();
  return (
    <label className={styles.compactToggle}>
      <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
      <span>略缩模式</span>
    </label>
  );
}
