import LexicalAnalyzer, {
    LexicalError,
    Token,
} from "./modules/lexicalAnalyzer";
import SyntaxAnalyzer, { SyntaxError } from "./modules/syntacticAnalyzer";

const compile = (input: string): string => {
    const lexer = new LexicalAnalyzer(input);
    const syntaxAnalyzer = new SyntaxAnalyzer();

    let token: Token;

    try {
        while (true) {
            token = lexer.getToken();

            console.log(`parsing token: ${token.token} (${token.type})`);
            syntaxAnalyzer.parseToken(token);
            if (token.type === "eof") break;
        }
    } catch (e) {
        if (e instanceof LexicalError) {
            console.log(
                `lex error: ${e.message}, row: ${e.row}, col: ${e.col}`
            );
        }
        if (e instanceof SyntaxError) {
            console.log(
                `syntax error: ${e.message}, row: ${e.row}, col: ${e.col}`
            );
        }
    }
    return "";
};

export const compileTest = () => {
    const p = "declara abd asigna x mas 22";
    //     const p = `declara texto asigna "Hola Mundo!"
    // declara num1 asigna 2
    // declara num2 asigna 5
    // declara num3

    // si num1 es mayor que num2 entonces
    // 	num3 asigna num1 mas num2
    // si no entonces
    // 	num3 asigna num1 por num2

    // repite num3 veces:
    // 	muestra(texto)`;
    compile(p);
};

export default compile;
