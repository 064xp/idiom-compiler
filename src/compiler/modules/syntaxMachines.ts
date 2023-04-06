import { BaseActionObject, StateNodeConfig, createMachine } from "xstate";
import { TokenType } from "./lexicalAnalyzer";
import { sendParent } from "xstate/lib/actions";

type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
};

type SyntaxMachine = StateNodeConfig<{}, any, TokenEvent, BaseActionObject>;

const declarationMachine: SyntaxMachine = {
    id: "declaration",
    initial: "expectIdentifier",
    states: {
        expectIdentifier: {
            on: [
                {
                    event: "*",
                    target: "expectAsigna",
                    cond: (context: {}, event: TokenEvent) =>
                        event.tokenType === "identifier",
                },
                {
                    event: "*",
                    target: "syntaxError",
                },
            ],
        },
        expectAsigna: {
            on: [
                {
                    event: "asigna",
                    target: "expectValue",
                },
                {
                    event: "*",
                    target: "syntaxError",
                },
            ],
        },
        expectValue: {
            on: [
                {
                    // if id or literal
                    event: "*",
                    target: "expectOperator",
                    cond: (context: {}, event: TokenEvent) =>
                        event.tokenType === "identifier" ||
                        event.tokenType === "literal",
                },
                {
                    event: "*",
                    target: "syntaxError",
                },
            ],
        },
        expectOperator: {
            on: [
                {
                    // if arithmetic operator
                    event: "*",
                    target: "expectValue",
                    cond: (context: {}, event: TokenEvent) =>
                        event.tokenType === "arithmeticOperator",
                },
                {
                    event: "\n",
                    target: "done",
                },
            ],
        },
        done: {
            type: "final",
        },
        syntaxError: {
            type: "final",
        },
    },
};

const ProgramMachine = createMachine({
    id: "program",
    tsTypes: {} as import("./syntaxMachines.typegen").Typegen0,
    initial: "start",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        start: {
            on: [
                {
                    event: "declara",
                    target: "declaration",
                },
            ],
        },
        declaration: {
            ...declarationMachine,
            onDone: "start",
        },
    },
});

export default ProgramMachine;
