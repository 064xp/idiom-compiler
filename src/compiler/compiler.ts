import LexicalAnalyzer, {
    LexicalError,
    Token,
} from "./modules/lexicalAnalyzer";
import SyntaxAnalyzer, { SyntaxError } from "./modules/syntacticAnalyzer";

const compile = (input: string): string => {
    const lexer = new LexicalAnalyzer(input);
    const syntaxAnalyzer = new SyntaxAnalyzer();

    let token: Token;

    while (true) {
        token = lexer.getToken();

        console.log(`parsing token: ${token.token} (${token.type})`);
        syntaxAnalyzer.parseToken(token);
        if (token.type === "eof") break;
    }
    // Commenting error handling for development
    // try {
    // } catch (e) {
    //     if (e instanceof LexicalError) {
    //         console.log(
    //             `lex error: ${e.message}, row: ${e.row}, col: ${e.col}`
    //         );
    //     } else if (e instanceof SyntaxError) {
    //         console.log(
    //             `syntax error: ${e.message}, row: ${e.row}, col: ${e.col}`
    //         );
    //     } else {
    //         console.log("Error ocurred", e);
    //     }
    // }
    return "";
};

export const compileTest = () => {
    // const p = "declara abd asigna x mas 22";
    // const p = `declara texto asigna "Hola Mundo!"
    //  repite num3 veces
    //  	declara x asigna 3
    //     repite 10 veces
    //         declara asdk asigna 23
    //         declara test asigna 22 mas 22
    //     fin
    //  fin`;
    const p = `
    si x no menor que _troValor entonces
        declara x asigna 10
        si Verdadero entonces
            declara asdf asigna 200
        fin
    fin
    `
    compile(p);
};

export default compile;
