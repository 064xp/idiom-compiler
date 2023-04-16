import IdiomRuntime from "./runtime";

type MuestraParams = string | number | boolean;

export const muestra = (obj: MuestraParams) => {
    switch(typeof obj) {
        case "number":
        case "boolean":
            IdiomRuntime.stdout = obj.toString();
            break;
        case "string":
            IdiomRuntime.stdout = obj;
            break;
        default: 
            IdiomRuntime.stdout = JSON.stringify(obj);
    }
}
