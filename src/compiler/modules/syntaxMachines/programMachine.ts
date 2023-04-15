import {
    assign,
    createMachine,
    DoneInvokeEvent,
    send,
    sendParent,
} from "xstate";
import { CodeGenResult } from "../jsCodegen";
import { TokenType } from "../lexicalAnalyzer";
import { SyntaxError, SymbolTable } from "../syntacticAnalyzer";

import AssignmentMachine from "./assignment";
import ConditionalMachine from "./conditional";
import DeclarationMachine from "./declaration";
import FunctionCallMachine from "./functionCall";
import LoopMachine from "./loop";

export type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
    forwardedByChild: boolean;
};

export type SyntaxMachineOnDone = DoneInvokeEvent<CodeGenResult>;

export type ProgramMachineContext = {
    isChild: boolean;
    tempIdentifier?: TokenEvent;
    symbolTable?: SymbolTable;
    generatedString: string;
};

export const raiseSyntaxError = (
    _: any,
    event: TokenEvent,
    message: string,
    showGot: boolean = true
) => {
    let msg = message;

    if (showGot) msg += `, se obtuvo ${JSON.stringify(event.type)}`;
    throw new SyntaxError(msg, event.row, event.col);
};

const childOnDone = [
    {
        target: "done",
        cond: (c: ProgramMachineContext) => c.isChild,
        actions: assign({
            generatedString: (
                c: ProgramMachineContext,
                e: SyntaxMachineOnDone
            ) => c.generatedString + e.data.result,
        }),
    },
    {
        target: "start",
        actions: assign({
            generatedString: (
                c: ProgramMachineContext,
                e: SyntaxMachineOnDone
            ) => c.generatedString + e.data.result,
        }),
    },
];

//@ts-ignore
const ProgramMachine = createMachine({
    predictableActionArguments: true,
    id: "program",
    initial: "start",
    schema: {
        context: {} as ProgramMachineContext,
        events: {} as TokenEvent,
    },
    context: { isChild: false, generatedString: "" },
    states: {
        start: {
            entry: assign({
                generatedString: (c: ProgramMachineContext) =>
                    c.generatedString || "",
            }),
            on: {
                declara: "declaration",
                "\n": {},
                repite: "loop",
                si: "conditional",
                "*": [
                    // On identifier
                    {
                        cond: (_, e: TokenEvent) =>
                            e.tokenType === "identifier",
                        target: "identifier",
                        actions: assign({
                            tempIdentifier: (_, e: TokenEvent) => e,
                        }),
                    },
                    {
                        // ignore EOFs
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                    },
                    {
                        actions: (c: ProgramMachineContext, e: TokenEvent) =>
                            raiseSyntaxError(c, e, "Token no esperado"),
                    },
                ],
            },
        },
        identifier: {
            on: {
                asigna: "assignment",
                "(": "functionCall",
                "*": {
                    actions: (c: ProgramMachineContext, e: TokenEvent) =>
                        raiseSyntaxError(
                            c,
                            e,
                            "Se esperaba una asignación o invocación de función"
                        ),
                },
            },
        },
        assignment: {
            invoke: {
                src: AssignmentMachine,
                autoForward: true,
                data: {
                    ...DeclarationMachine.initialState.context,
                    identifier: (c: ProgramMachineContext) => c.tempIdentifier,
                    symbolTable: (c: ProgramMachineContext) => c.symbolTable,
                },
                onDone: childOnDone,
            },
        },
        functionCall: {
            invoke: {
                src: FunctionCallMachine,
                autoForward: true,
                data: {
                    ...FunctionCallMachine.initialState.context,
                    identifier: (c: ProgramMachineContext) => c.tempIdentifier,
                    symbolTable: (c: ProgramMachineContext) => c.symbolTable,
                },
                onDone: childOnDone,
            },
        },
        declaration: {
            invoke: {
                src: DeclarationMachine,
                autoForward: true,
                onDone: childOnDone,
                data: {
                    ...DeclarationMachine.initialState.context,
                    symbolTable: (c: ProgramMachineContext) => c.symbolTable,
                },
            },
        },
        loop: {
            invoke: {
                src: LoopMachine,
                autoForward: true,
                onDone: childOnDone,
                data: {
                    ...LoopMachine.initialState.context,
                    symbolTable: (c: ProgramMachineContext) => c.symbolTable,
                },
            },
        },
        conditional: {
            invoke: {
                src: ConditionalMachine,
                onDone: childOnDone,
                id: "conditionalMachine",
                autoForward: true,
                data: { 
                    ...ConditionalMachine.initialState.context,
                    symbolTable: (c: ProgramMachineContext) => c.symbolTable,
                },
            },
            on: {
                "*": [
                    // Since conditional needs to look ahead to know if there's an
                    // else or not, it forwards the last token to its parent.
                    // Here we forward that token event to this machine's parent
                    // if it has one and if it doesn't it forwards it to this
                    // machine
                    {
                        cond: (c: ProgramMachineContext, e: TokenEvent) =>
                            e.forwardedByChild && c.isChild,

                        actions: sendParent((_, e) => e),
                    },
                    // Forward the last token the child machine consumed
                    {
                        cond: (c: ProgramMachineContext, e: TokenEvent) =>
                            e.forwardedByChild,
                        actions: send((_, e) => e),
                    },
                ],
            },
        },
        done: {
            type: "final",
            data: (c, _) => {
                if (c.symbolTable === undefined)
                    throw new Error(
                        "Symbol table was not passed to program machine."
                    );

                return {
                    result: c.generatedString,
                };
            },
        },
    },
});

export default ProgramMachine;
