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

        console.log(`parsing token: ${JSON.stringify(token.token)} (${token.type})`);
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
    repite 3 veces
        declara testing asigna 3
        declara repiteABC asigna 1 mas testing modulo 5

    fin

    declara x asigna 2
    declara yo asigna 100

    si x mayor que 3 o yo menor que 25 entonces
        declara a asigna 25
        declara abc asigna "testing"
    fin
    si no pero x menor o igual que 5 entonces
        declara aa asigna 2
    fin
    si no pero yo mayor o igual que 9 entonces
        declara aaa asigna 19
    fin
    si no entonces
        declara xx asigna 111
    fin
    `
    compile(p);
};

export default compile;
