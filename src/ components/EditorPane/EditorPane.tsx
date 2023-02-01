import React from "react";
import Editor from "@monaco-editor/react";
import styles from "./EditorPane.module.css";

const EditorPane = () => {
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
        defaultValue="// some comment"
        className={styles.editor}
        options={options}
      />
      <div className={styles.outputPanel}>
        <p className={styles.placeholder}>Output</p>
      </div>
    </div>
  );
};

export default EditorPane;
