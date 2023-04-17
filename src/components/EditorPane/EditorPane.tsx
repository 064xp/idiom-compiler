import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import styles from "./EditorPane.module.css";
import { options, tokensProvider, conf, theme } from "../../config/monaco";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import OutputPanel, { OutputPanelHandle } from "../OutputPanel/OutputPanel";

interface IProps {
    currentFile: EditorFile;
    onEditorChange: (
        value: string | undefined,
        ev: monaco.editor.IModelContentChangedEvent
    ) => void;
    outputPanelRef: React.Ref<OutputPanelHandle>;
}

const EditorPane = ({
    currentFile,
    onEditorChange,
    outputPanelRef,
}: IProps) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount = (
        editor: monaco.editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        editorRef.current = editor;

        monaco.languages.register({ id: "icp" });
        monaco.languages.setMonarchTokensProvider("icp", tokensProvider);
        monaco.languages.setLanguageConfiguration("icp", conf);
        monaco.editor.defineTheme("icpTheme", theme);
        monaco.editor.setTheme("icpTheme");
    };

    return (
        <div className={styles.container}>
            <Editor
                height="90vh"
                width="50vw"
                defaultLanguage="icp"
                className={styles.editor}
                options={options}
                path={currentFile?.name}
                defaultValue={currentFile?.value || ""}
                onMount={handleEditorDidMount}
                onChange={onEditorChange}
            />
            <div className={styles.outputPanel}>
                <OutputPanel ref={outputPanelRef} />
            </div>
        </div>
    );
};

export default EditorPane;
