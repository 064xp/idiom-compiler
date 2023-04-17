import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import IdiomRuntime from "../../compiler/runtime";
import styles from "./OutputPanel.module.css";

interface OutputPanelProps {}

export interface OutputPanelHandle {
    clearOutput: () => void;
}

const OutputPanel = forwardRef<OutputPanelHandle, OutputPanelProps>(
    (props, ref) => {
        const [outputMessages, setOutputMessages] = useState<string[]>([]);

        useEffect(() => {
            IdiomRuntime.subscribeStdoutChange(onStdoutChange);

            return () => {
                IdiomRuntime.unsubscribeStdoutChange(onStdoutChange);
            };
        }, []);

        useImperativeHandle(
            ref,
            () => {
                return {
                    clearOutput: () => {
                        console.log('clearing output')
                        setOutputMessages([]);
                    },
                };
            },
            []
        );

        const onStdoutChange = (value: string) => {
            console.log("stdout changed", value);
            setOutputMessages((outputMessages) => [...outputMessages, value]);
        };

        return (
            <div className={styles.container}>
                {outputMessages.map((m, i) => (
                    <div key={i}>
                        <p>{m}</p>
                    </div>
                ))}
            </div>
        );
    }
);

export default OutputPanel;
