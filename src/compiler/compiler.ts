import LexicalAnalyzer, { Token } from "./modules/lexicalAnalyzer";
import Preprocessor from "./modules/preprocessor";
import SyntaxAnalyzer from "./modules/syntacticAnalyzer";
import IdiomRuntime from "./runtime";

type CompilerErrorType =
    | "Error Semántico"
    | "Error Sintáctico"
    | "Error Léxico";

export class IdiomCompilerError extends Error {
    row: number;
    col: number;
    type: CompilerErrorType;

    constructor(
        type: CompilerErrorType,
        message: string,
        row: number,
        col: number
    ) {
        super();
        this.message = message;
        this.row = row;
        this.col = col;
        this.type = type;
    }
}

export type CompilerError = {
    type: CompilerErrorType;
};

const compile = (input: string): string => {
    const preprocessor = new Preprocessor();
    input = preprocessor.run(input);
    console.log("input after preprocessor", input);
    const lexer = new LexicalAnalyzer(input);
    const syntaxAnalyzer = new SyntaxAnalyzer();
    let code: string | null = "";

    let token: Token;

    try {
        while (true) {
            token = lexer.getToken();

            console.log(
                `parsing token: ${JSON.stringify(token.token)} (${token.type})`
            );
            code = syntaxAnalyzer.parseToken(token);
            if (code !== null) break;
        }
        // Commenting error handling for development
    } catch (e) {
        if (e instanceof IdiomCompilerError) {
            IdiomRuntime.writeStderr(e);
        } else {
            console.log("Caught error in compiler", e);
        }
    }
    return code as string;
};

export const compileTest = () => {
    // const p = "abd asigna x mas 22";
    // const p = `declara texto asigna "Hola Mundo!"
    //  repite num3 veces
    //  	declara x asigna 3
    //     repite 10 veces
    //         declara asdk asigna 23
    //         declara test asigna 22 mas 22
    //     fin
    //  fin`;
    // const p = `
    // repite 3 veces
    //     si x mayor que 10 entonces
    //         declara a
    //     fin
    //     si no pero xx entonces
    //         declara b
    //     fin
    // fin
    // `
    const p = `
    declara global asigna "Mr WorldWide"

    repite 3 veces
        declara testing asigna 3
        declara repiteABC asigna 1 mas testing modulo 5
    fin

    declara x asigna "hola mundo!"
    declara yo asigna 100

    si x mayor que 3 o yo menor que 25 entonces
        declara testing asigna 44
        declara a asigna 25
        declara abc asigna "testing"
    fin
    si no pero x menor o igual que 5 entonces
        declara testing asigna 19021
        declara aa asigna 2
    fin
    si no pero yo mayor o igual que 9 entonces
        declara testing asigna 123129
        declara aaa asigna 19
    fin
    si no entonces
        declara xx asigna 111
        declara testing asigna 18
    fin

    muestra(x)
    `;
    return compile(p);
};

export default compile;
