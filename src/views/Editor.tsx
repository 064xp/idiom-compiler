import React, { useState, useRef } from "react";
import EditorPane from "../ components/EditorPane/EditorPane";
import MainToolbar from "../ components/MainToolbar/MainToolbar";
import TabBar from "../ components/TabBar/TabBar";
import initialProgram from "../config/initialProgram";

const Editor = () => {
  const [files, setFiles] = useState<OpenFiles>([initialProgram]);
  const [currentFile, setCurrentFile] = useState<number>(0);
  const downloadRef = useRef<HTMLAnchorElement>(null);

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

  const downloadCurrentFile = () => {
    const file = files[currentFile];
    const data = new Blob([file.value], { type: "text/plain" });
    if (!downloadRef.current) return;

    downloadRef.current.setAttribute("download", file.name);
    downloadRef.current.href = URL.createObjectURL(data);
    const event = new MouseEvent("click");
    downloadRef.current.dispatchEvent(event);
  };

  const onEditorChange = (value: string | undefined, ev: any) => {
    if (!value) return;

    const newFiles = [...files];
    newFiles[currentFile].value = value;
    setFiles(newFiles);
  };

  return (
    <div>
      <MainToolbar
        onFileOpen={onFileOpen}
        onDownloadClick={downloadCurrentFile}
      />
      <TabBar
        files={files}
        currentFile={currentFile}
        setCurrentFile={setCurrentFile}
      />
      <EditorPane
        currentFile={files[currentFile]}
        onEditorChange={onEditorChange}
      />
      <a href="" ref={downloadRef} style={{ display: "none" }}></a>
    </div>
  );
};

export default Editor;
