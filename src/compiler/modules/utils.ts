import { assign } from "xstate";
import { ScopedContext } from "./syntaxMachines/programMachine";

export const generateUUID = () => {
    if (typeof self.crypto !== "undefined" && self.crypto.randomUUID)
        return self.crypto.randomUUID();

    let dt = new Date().getTime();
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            let r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
};

export const assignScopeID = assign<ScopedContext>({
    scopeID: () => generateUUID(),
});

export const clearScopeSymbols = (context: ScopedContext) => {
    if (context.symbolTable === undefined)
        throw new Error(`Symbol table was not passed to clearScopeSymbols`);

    context.symbolTable.forEach((value, key) => {
        if (value.scopeID === context.scopeID) context.symbolTable!.delete(key);
    });
};

// https://stackoverflow.com/a/1349426
export const getRandomID = (length: number) => {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
};
