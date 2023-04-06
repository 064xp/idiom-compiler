import LexicalAnalyzer, {
    LexicalError,
    Token,
} from "./modules/lexicalAnalyzer";
import SyntaxAnalyzer, { SyntaxError } from "./modules/syntacticAnalyzer";

const compile = (input: string): string => {
    const lexer = new LexicalAnalyzer(input);
    const syntaxAnalyzer = new SyntaxAnalyzer();

    let token: Token | null;

    try {
        while ((token = lexer.getToken())) {
            // console.log(token);
            syntaxAnalyzer.parseToken(token);
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
    const p = `declara texto asigna "Hola Mundo!"
declara num1 asigna 2
declara num2 asigna 5
declara num3

si num1 es mayor que num2 entonces
	num3 asigna num1 mas num2
si no entonces
	num3 asigna num1 por num2

repite num3 veces:
	muestra(texto)`;
    compile(p);
};

export default compile;
