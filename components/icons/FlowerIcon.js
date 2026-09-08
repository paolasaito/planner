import styles from "./FlowerIcon.module.css";

export default function FlowerIcon({
  size = 24,
  color = "currentColor",
  centerColor = "#f6c945",
  spinning = false,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${styles.flower} ${spinning ? styles.spinning : ""} ${className}`}
      role="img"
      aria-hidden="true"
    >
      <g fill={color}>
        <ellipse cx="12" cy="6" rx="3.2" ry="5" />
        <ellipse cx="12" cy="6" rx="3.2" ry="5" transform="rotate(72 12 12)" />
        <ellipse cx="12" cy="6" rx="3.2" ry="5" transform="rotate(144 12 12)" />
        <ellipse cx="12" cy="6" rx="3.2" ry="5" transform="rotate(216 12 12)" />
        <ellipse cx="12" cy="6" rx="3.2" ry="5" transform="rotate(288 12 12)" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill={centerColor} />
    </svg>
  );
}
