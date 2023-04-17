import { IdiomCompilerError } from "./compiler";
import * as _builtin from "./standardLibrary";

type StdStrChangeListener = (value: string) => void;
type StderrChangeListener = (value: IdiomCompilerError) => void;

export type StdStream = "stdin" | "stdout" | "stderr";

export default class IdiomRuntime {
    static #stdout: string = "";
    static #stderr: IdiomCompilerError;
    static #stdin: string = "";
    static #stdoutListeners: StdStrChangeListener[] = [];
    static #stderrListeners: StderrChangeListener[] = [];

    static runCode = (code: string) => {
        const func = new Function(code).bind(_builtin);
        func();
    };

    // Stdout

    static writeStdout = (value: string) => {
        this.#stdout = value;
        this.#stdoutListeners.forEach((listener) => {
            listener(value);
        });
    };
    static readStdout = () => this.#stdout;

    static subscribeStdoutChange = (fn: StdStrChangeListener) => {
        this.#stdoutListeners.push(fn);
    };

    static unsubscribeStdoutChange = (fn: StdStrChangeListener) => {
        const index = this.#stdoutListeners.indexOf(fn);
        if (index > -1) this.#stdoutListeners.splice(index, 1);
    };

    // Stderr

    static writeStderr = (value: IdiomCompilerError) => {
        this.#stderr = value;
        this.#stderrListeners.forEach((listener) => {
            listener(value);
        });
    };

    static readStderr = () => this.#stderr;

    static subscribeStderrChange = (fn: StderrChangeListener) => {
        this.#stderrListeners.push(fn);
    };

    static unsubscribeStderrChange = (fn: StderrChangeListener) => {
        const index = this.#stderrListeners.indexOf(fn);
        if (index > -1) this.#stderrListeners.splice(index, 1);
    };
}
