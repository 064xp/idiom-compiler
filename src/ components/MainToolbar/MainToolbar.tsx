import React from "react";
import styles from "./MainToolbar.module.css";
import CircularButton from "../CircularButton/CircularButton";

import RunIcon from "../../assets/play-solid.svg";
import LoadIcon from "../../assets/file-solid.svg";
import SaveIcon from "../../assets/floppy-disk-solid.svg";

interface HTMLInputEvent extends React.FormEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

interface IProps {
  onFileOpen: (file: EditorFile) => void;
  onDownloadClick: () => void;
}

const MainToolbar = ({ onFileOpen, onDownloadClick }: IProps) => {
  const onFileInputChanged: React.FormEventHandler<HTMLInputElement> = (
    event: HTMLInputEvent
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList?.length == 0) return;

    const file = fileList[0];

    // read file
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      if (!event.target) return;

      onFileOpen({
        name: file.name,
        value: event.target.result as string,
        language: "icp",
      });
    });

    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <CircularButton
        icon={RunIcon}
        size="5.2em"
        className={styles.mainButtons}
      />
      <CircularButton
        icon={LoadIcon}
        className={styles.mainButtons}
        isFileInput={true}
        fileInputAttrs={{
          onChange: onFileInputChanged,
        }}
      />
      <CircularButton
        icon={SaveIcon}
        className={styles.mainButtons}
        onClick={onDownloadClick}
      />
    </div>
  );
};

export default MainToolbar;
