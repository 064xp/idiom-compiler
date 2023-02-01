import React from "react";
import styles from "./MainToolbar.module.css";
import CircularButton from "../CircularButton/CircularButton";

import RunIcon from "../../assets/play-solid.svg";
import LoadIcon from "../../assets/file-solid.svg";
import SaveIcon from "../../assets/floppy-disk-solid.svg";

const MainToolbar = () => {
  return (
    <div className={styles.container}>
      <CircularButton icon={RunIcon} size="5.2em" />
      <CircularButton icon={LoadIcon} />
      <CircularButton icon={SaveIcon} />
    </div>
  );
};

export default MainToolbar;
