import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { IdiomCompilerError } from "../../compiler/compiler";
import IdiomRuntime from "../../compiler/runtime";
import styles from "./OutputPanel.module.css";

import ErrorIcon from "../../assets/circle-exclamation-solid.svg";

interface OutputPanelProps {}

export interface OutputPanelHandle {
    clearOutput: () => void;
}

const OutputPanel = forwardRef<OutputPanelHandle, OutputPanelProps>(
    (_, ref) => {
        const [outputMessages, setOutputMessages] = useState<string[]>([]);
        const [error, setError] = useState<IdiomCompilerError | null>(null);

        useEffect(() => {
            IdiomRuntime.subscribeStdoutChange(onStdoutChange);
            IdiomRuntime.subscribeStderrChange(onNewError);

            return () => {
                IdiomRuntime.unsubscribeStdoutChange(onStdoutChange);
                IdiomRuntime.unsubscribeStderrChange(onNewError);
            };
        }, []);

        useImperativeHandle(
            ref,
            () => {
                return {
                    clearOutput: () => {
                        setOutputMessages([]);
                        setError(null);
                    },
                };
            },
            []
        );

        const onStdoutChange = (value: string) => {
            setOutputMessages((outputMessages) => [...outputMessages, value]);
        };

        const onNewError = (value: IdiomCompilerError) => {
            console.log("got error", value);
            setError(value);
        };

        return (
            <div className={styles.container}>
                {error && (
                    <div
                        className={`${styles.outputMessageContainer} 
                            ${styles.errorContainer}`}
                    >
                        <img src={ErrorIcon} className={styles.errorIcon} />
                        <div>
                            <h2 className={styles.errorType}>{error.type}</h2>
                            <p className={styles.errorMessage}>
                                {error.message}
                            </p>
                            <p className={styles.errorLocation}>
                                Línea {error.row}, caracter {error.col}
                            </p>
                        </div>
                    </div>
                )}

                {outputMessages.map((m, i) => (
                    <div
                        key={i}
                        className={`${styles.outputMessageContainer} 
                            ${styles.messageContainer}`}
                    >
                        <p className={styles.messageText}>{m}</p>
                    </div>
                ))}
            </div>
        );
    }
);

export default OutputPanel;
