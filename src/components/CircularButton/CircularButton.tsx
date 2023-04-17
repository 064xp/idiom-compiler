import React, { useRef } from "react";
import styles from "./CircularButton.module.css";
import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  icon: string;
  size?: number | string;
  color?: string;
  alt?: string;
  className?: string;
  isFileInput?: boolean;
  fileInputAttrs?: React.HTMLAttributes<HTMLInputElement>;
};

const CircularButton = ({
  size = "4em",
  icon,
  color,
  alt,
  className,
  isFileInput,
  fileInputAttrs,
  ...rest
}: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    if (isFileInput) ref.current?.click();

    if (rest.onClick) rest.onClick(ev);
  };

  return (
    <button
      style={{
        height: size,
        width: size,
        backgroundColor: color || "",
      }}
      className={clsx(styles.button, className)}
      onClick={onClick}
      {...rest}
    >
      <img src={icon} alt={alt} />
      {isFileInput && (
        <input
          type="file"
          ref={ref}
          className={styles.fileInput}
          {...fileInputAttrs}
        />
      )}
    </button>
  );
};

export default CircularButton;
