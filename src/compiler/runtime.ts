import * as _builtin from './standardLibrary';

type StreamChangeListener = (value: string) => void;

export default class IdiomRuntime {
    static #stdout: string = "";
    static #stderr: string = "";
    static #stdin: string = "";
    static #stdoutListeners: StreamChangeListener[] = [];

    static runCode = (code: string) => {
        const builtin = _builtin;
        eval(code);
    }

    static writeStdout = (value: string) => {
        this.#stdout = value;
        this.#stdoutListeners.forEach(listener => {
            listener(value);
        });
    }

    static readStdout = (): string => this.#stdout;

    static subscribeStdoutChange = (fn: StreamChangeListener) => {
        this.#stdoutListeners.push(fn);
    }

    static unsubscribeStdoutChange = (fn: StreamChangeListener) => {
        const index = this.#stdoutListeners.indexOf(fn);
        if (index > -1) {
            this.#stdoutListeners.splice(index, 1);
        }
    }
}
