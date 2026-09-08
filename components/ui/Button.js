import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./Button.module.css";

export default function Button({
  children,
  loading = false,
  variant = "primary",
  type = "submit",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <FlowerIcon size={18} spinning color="#fff" /> : children}
    </button>
  );
}
