import React from "react";
import Editor from "@monaco-editor/react";
import styles from "./EditorPane.module.css";

interface IProps {
  currentFile: EditorFile;
}

const EditorPane = ({ currentFile }: IProps) => {
  const options = {
    minimap: {
      enabled: false,
    },
  };
  return (
    <div className={styles.container}>
      <Editor
        height="90vh"
        width="50vw"
        defaultLanguage="javascript"
        className={styles.editor}
        options={options}
        path={currentFile?.name}
        defaultValue={currentFile?.value || ""}
      />
      <div className={styles.outputPanel}>
        <p className={styles.placeholder}>Output</p>
      </div>
    </div>
  );
};

export default EditorPane;
