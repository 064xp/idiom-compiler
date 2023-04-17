import IdiomRuntime from "./runtime";

type MuestraParams = string | number | boolean;

export const muestra = (obj: MuestraParams) => {
    switch(typeof obj) {
        case "number":
        case "boolean":
            IdiomRuntime.writeStdout(obj.toString());
            break;
        case "string":
            IdiomRuntime.writeStdout(obj);
            break;
        default: 
            IdiomRuntime.writeStdout(JSON.stringify(obj));
    }
}
