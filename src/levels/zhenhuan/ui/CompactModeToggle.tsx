import { useForcedSmallScreenMode } from "../../../logic/useSmallScreen";
import styles from "./zhenhuan.module.css";

/** Same 略缩模式 preference as the Sun King campaign (phones get it automatically). */
export function CompactModeToggle() {
  const [forced, setForced] = useForcedSmallScreenMode();
  return (
    <label className={styles.compactToggle}>
      <input type="checkbox" checked={forced} onChange={(e) => setForced(e.target.checked)} />
      <span>略缩模式</span>
    </label>
  );
}
