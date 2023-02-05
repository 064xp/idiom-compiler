import React from "react";
import styles from "./TabBar.module.css";
import clsx from "clsx";

interface IProps {
  file: EditorFile;
  isSelected: boolean;
  onClick: () => void;
}

const Tab = ({ file, isSelected, onClick }: IProps) => {
  return (
    <button
      className={clsx(styles.tab, isSelected && styles.selectedTab)}
      onClick={onClick}
    >
      <span className={styles.tabName}>{file.name}</span>
    </button>
  );
};

export default Tab;
