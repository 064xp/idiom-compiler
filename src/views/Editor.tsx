import React, { useState } from "react";
import EditorPane from "../ components/EditorPane/EditorPane";
import MainToolbar from "../ components/MainToolbar/MainToolbar";

const Editor = () => {
  const [files, setFiles] = useState<OpenFiles>([]);

  const [currentFile, setCurrentFile] = useState<number>(0);

  const onFileOpen = (file: EditorFile) => {
    setFiles([
      ...files,
      {
        name: file.name,
        language: file.language,
        value: file.value,
      },
    ]);

    setCurrentFile(files.length);
  };

  return (
    <div>
      <button onClick={() => setCurrentFile(0)}>test</button>

      <button onClick={() => setCurrentFile(1)}>hello world</button>

      <MainToolbar onFileOpen={onFileOpen} />
      <EditorPane currentFile={files[currentFile]} />
    </div>
  );
};

export default Editor;
