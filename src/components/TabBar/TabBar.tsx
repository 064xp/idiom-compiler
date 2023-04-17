import React from "react";
import styles from "./TabBar.module.css";
import Tab from "./Tab";

interface IProps {
  files: EditorFile[];
  currentFile: number;
  setCurrentFile: (fileIndex: number) => void;
}

const TabBar = ({ files, currentFile, setCurrentFile }: IProps) => {
  const onTabClick = (tabNumber: number) => {
    setCurrentFile(tabNumber);
  };

  return (
    <div className={styles.tabBar}>
      {files.map((file, i) => (
        <Tab
          file={file}
          key={i}
          isSelected={i == currentFile}
          onClick={() => {
            onTabClick(i);
          }}
        />
      ))}
    </div>
  );
};

export default TabBar;
