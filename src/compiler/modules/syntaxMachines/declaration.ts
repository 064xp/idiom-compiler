import { assign, createMachine } from "xstate";
import {
    TokenEvent,
    raiseSyntaxError,
    SyntaxMachineOnDone,
} from "./programMachine";
import AssignmentMachine from "./assignment";
import { SymbolTable } from "../syntacticAnalyzer";
import { generateDeclaration } from "../jsCodegen";

type DeclarationContext = {
    identifier?: TokenEvent;
    assignmentString: string;
    symbolTable?: SymbolTable;
    scopeID: string;
};

const declarationMachine = createMachine({
    predictableActionArguments: true,
    id: "declaration",
    initial: "expectIdentifier",
    schema: {
        context: {} as DeclarationContext,
        events: {} as TokenEvent,
    },
    context: {
        assignmentString: "",
        scopeID: "global"
    },
    states: {
        expectIdentifier: {
            on: {
                "*": [
                    {
                        target: "expectAsigna",
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "identifier",
                        actions: assign({
                            identifier: (_, e: TokenEvent) => e,
                        }),
                    },
                    {
                        actions: (c, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Se esperaba un identificador`
                            ),
                    },
                ],
            },
        },
        expectAsigna: {
            on: {
                asigna: "invokeAssignment",
                "*": [
                    {
                        target: "done",
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "newline" ||
                            event.tokenType === "eof",
                    },
                    {
                        actions: (c, e: TokenEvent) =>
                            raiseSyntaxError(c, e, `Se esperaba un "asigna"`),
                    },
                ],
            },
        },
        invokeAssignment: {
            invoke: {
                id: "assignmentMachine",
                src: AssignmentMachine,
                autoForward: true,
                data: {
                    ...AssignmentMachine.initialState.context,
                    identifier: (c: DeclarationContext) => c.identifier,
                    symbolTable: (c: DeclarationContext) => c.symbolTable,
                },
                onDone: {
                    target: "done",
                    actions: assign({
                        assignmentString: (
                            _: DeclarationContext,
                            e: SyntaxMachineOnDone
                        ) => e.data.result,
                    }),
                },
            },
        },
        done: {
            type: "final",
            data: (c, _) => {
                if (c.symbolTable === undefined)
                    throw new Error(
                        "Symbol table was not passed to declaration machine."
                    );

                return {
                    result: generateDeclaration(
                        c.symbolTable,
                        c.identifier as TokenEvent,
                        c.assignmentString,
                        c.scopeID
                    ),
                };
            },
        },
    },
});

export default declarationMachine;
