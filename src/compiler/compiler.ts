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
        } else if (e instanceof SyntaxError) {
            console.log(
                `syntax error: ${e.message}, row: ${e.row}, col: ${e.col}`
            );
        } else {
            console.log("Error ocurred", e);
        }
    }
    return "";
};

export const compileTest = () => {
    // const p = "declara abd asigna x mas 22";
    const p = `declara texto asigna "Hola Mundo!"
     repite num3 veces:
     	declara x asigna 3`;
    compile(p);
};

export default compile;
