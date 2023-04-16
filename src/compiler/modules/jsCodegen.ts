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

export type CodeGenEvent = {
    type: "CODE_GENERATED";
    result: string;
};

const arithmeticOperatorMap = {
    mas: "+",
    menos: "-",
    entre: "/",
    por: "*",
    modulo: "%",
};

const comparisonOperatorMap = {
    "menor que": "<",
    "mayor que": ">",
    "igual que": "===",
    "menor o igual que": "<=",
    "mayor o igual que": ">=",
};

const logicalOperatorMap = {
    y: "&&",
    o: "||",
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
                output +=
                    arithmeticOperatorMap[
                    token.type as keyof typeof arithmeticOperatorMap
                    ];
                break;
            default:
                output += token.type;
        }
    });

    output += ";";

    return output;
};

export const generateDeclaration = (
    symbolTable: SymbolTable,
    identifier: TokenEvent,
    assignmentStr: string,
    scopeID: string
): string => {
    if (symbolTable.has(identifier.type))
        throw new SemanticError(
            `Se intentó declarar una variable ya existente "${identifier.type}"`,
            identifier.row,
            identifier.col
        );

    symbolTable.set(identifier.type, {
        type: identifier.tokenType,
        scopeID: scopeID,
    });

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

export const generateCondition = (
    symbolTable: SymbolTable,
    tokens: TokenEvent[]
): string => {
    let output = "";

    tokens.forEach((token) => {
        switch (token.tokenType) {
            case "identifier":
                if (!symbolTable.has(token.type))
                    throw new SemanticError(
                        `Variable no existente "${token.type}"`,
                        token.row,
                        token.col
                    );
                output += token.type;
                break;

            case "numberLiteral":
            case "stringLiteral":
            case "booleanLiteral":
                output += token.type;
                break;
            case "comparisonOperator":
                output +=
                    comparisonOperatorMap[
                    token.type as keyof typeof comparisonOperatorMap
                    ];
                break;
            case "logicalOperator":
                output +=
                    logicalOperatorMap[
                    token.type as keyof typeof logicalOperatorMap
                    ];
                break;
            default:
                output += token.type;
        }
    });

    return output;
};

export const generateConditional = (
    conditionStrings: string[],
    instructionBlocks: string[]
): string => {
    let output = `
    if(${conditionStrings[0]}) {
        ${instructionBlocks[0] || ""}
    }
    `;

    if (conditionStrings.length > 1) {
        for (let i = 1; i < conditionStrings.length; i++) {
            output += `
            else if(${conditionStrings[i]}){
                ${instructionBlocks[i] || ""}
            }
            `;
        }
    }

    if (instructionBlocks.length > conditionStrings.length) {
        output += `
        else {
            ${instructionBlocks[instructionBlocks.length - 1]}
        }
        `;
    }

    return output;
};

export const generateFunctionCall = (
    symbolTable: SymbolTable,
    parameters: TokenEvent[],
    functionName: TokenEvent
): string => {
    if (!symbolTable.has(functionName.type))
        throw new SemanticError(
            `La función "${functionName.type}" no existe`,
            functionName.row,
            functionName.col
        );

    const tokenType = symbolTable.get(functionName.type)!.type;
    if (tokenType !== "function" && tokenType !== "builtinFunction")
        throw new SemanticError(
            `El identificador "${functionName.type}" no es una función`,
            functionName.row,
            functionName.col
        );

    let output = "";

    // If it's a builtin function, call from the builtin module
    if (tokenType === "builtinFunction")
        output = `builtin.${functionName.type}(`;
    else 
        output = `${functionName.type}(`;

    parameters.forEach((p, i) => {
        if (p.tokenType === "identifier" && !symbolTable.has(p.type))
            throw new SemanticError(
                `El parámetro "${p.type}" para la función ${functionName.type} no existe`,
                p.row,
                p.col
            );

        output += p.type;
        if (i !== parameters.length - 1) output += ",";
    });

    output += ");";

    return output;
};
