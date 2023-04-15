import { SymbolTable } from "./syntacticAnalyzer";
import { TokenEvent } from "./syntaxMachines/programMachine";

export class SemanticError extends Error {
    row: number;
    col: number;
    constructor(message: string, row: number, col: number) {
        super();
        this.message = message;
        this.row = row;
        this.col = col;
    }
}

export type CodeGenResult = {
    result: string;
};

const operatorMap = {
    mas: "+",
    menos: "-",
    entre: "/",
    por: "*",
    modulo: "%",
};

export const generateAssignment = (
    symbolTable: SymbolTable,
    tokens: TokenEvent[],
    identifier: TokenEvent
): string => {
    let output = `${identifier.type} = `;

    tokens.forEach((token) => {
        // if is var, check that it exists
        switch (token.tokenType) {
            case "identifier":
                if (!symbolTable.has(token.type)) {
                    throw new SemanticError(
                        `Se intentó acceder a variable "${token.type}" no existente`,
                        token.row,
                        token.col
                    );
                }

                output += token.type;
                break;

            case "arithmeticOperator":
                output += operatorMap[token.type as keyof typeof operatorMap];
                break;
            default:
                output += token.type;
        }
    });

    output += ";";

    console.log("assignment output", output);
    return output;
};

export const generateDeclaration = (
    symbolTable: SymbolTable,
    identifier: TokenEvent,
    assignmentStr: string
): string => {
    if (symbolTable.has(identifier.type))
        throw new SemanticError(
            `Se intentó declarar una variable ya existente "${identifier.type}"`,
            identifier.row,
            identifier.col
        );

    symbolTable.set(identifier.type, { type: identifier.tokenType });

    let output = "let";
    if (assignmentStr.length > 0) output += ` ${assignmentStr}`;
    else output += ` ${identifier.type};`;

    return output;
};

export const generateLoop = (
    symbolTable: SymbolTable,
    iterations: TokenEvent,
    instructionsString: string
): string => {
    // Check that the variable exists
    if (
        iterations.tokenType === "identifier" &&
        !symbolTable.has(iterations.type)
    )
        throw new SemanticError(
            `La variable "${iterations.type}" no existe`,
            iterations.row,
            iterations.col
        );

    if (
        (iterations.tokenType === "identifier" &&
            symbolTable.get(iterations.type)!.type !== "numberLiteral") ||
        iterations.tokenType !== "numberLiteral"
    )
        throw new SemanticError(
            `El valor de ciclo "${iterations.type}" debe ser un número`,
            iterations.row,
            iterations.col
        );

    let output = `
        for(let i=0; i<${parseInt(iterations.type)}; i++){
            ${instructionsString}
        }
        `;

    return output;
};
