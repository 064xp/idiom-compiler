import * as _builtin from './standardLibrary';

export default class IdiomRuntime {
    static stdout: string;
    static stderr: string;
    static stdin: string;

    static runCode = (code: string) => {
        const builtin = _builtin;
        eval(code);
        console.log('stdout', IdiomRuntime.stdout);
    }
}
