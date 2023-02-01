import React from "react";
import styles from "./CircularButton.module.css";
import clsx from "clsx";

interface IProps {
  icon: string;
  size?: number | string;
  color?: string;
  alt?: string;
  className?: string;
}

const CircularButton = ({
  size = "4em",
  icon,
  color,
  alt,
  className,
  ...rest
}: IProps) => {
  return (
    <button
      className={clsx(styles.button, className)}
      style={{ height: size, width: size, backgroundColor: color || "" }}
      {...rest}
    >
      <img src={icon} alt={alt || "Button"} />
    </button>
  );
};

export default CircularButton;
