import { assign, createMachine, send, sendParent } from "xstate";
import { TokenType } from "../lexicalAnalyzer";
import { SyntaxError } from "../syntacticAnalyzer";
import AssignmentMachine from "./assignment";
import ConditionalMachine from "./conditional";

import DeclarationMachine from "./declaration";
import LoopMachine from "./loop";

export type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
    forwardedByChild: boolean;
};

type ProgramMachineContext = {
    isChild: boolean;
    tempIdentifier: string;
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
    },
    {
        target: "start",
    },
];

const ProgramMachine = createMachine({
    predictableActionArguments: true,
    id: "program",
    initial: "start",
    schema: {
        context: {
            isChild: false,
            tempIdentifier: "",
        } as ProgramMachineContext,
        events: {} as TokenEvent,
    },
    context: { isChild: false, tempIdentifier: "" },
    states: {
        start: {
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
                            tempIdentifier: (_, e: TokenEvent) => e.type,
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
            },
        },
        assignment: {
            invoke: {
                src: AssignmentMachine,
                autoForward: true,
                data: {
                    identifier: (c: ProgramMachineContext) => c.tempIdentifier,
                },
                onDone: childOnDone,
            },
        },
        functionCall: {},
        declaration: {
            invoke: {
                src: DeclarationMachine,
                autoForward: true,
                onDone: childOnDone,
            },
        },
        loop: {
            invoke: {
                src: LoopMachine,
                autoForward: true,
                onDone: childOnDone,
            },
        },
        conditional: {
            invoke: {
                src: ConditionalMachine,
                onDone: childOnDone,
                id: "conditionalMachine",
                autoForward: true,
            },
            on: {
                "*": [
                    // Since conditional needs to look ahead to know if there's an
                    // else or not, it forwards the last token to its parent.
                    // Here we forward that token event to this machine's parent
                    // if it has one and if the event is marked as forwarded
                    {
                        cond: (c: ProgramMachineContext, e: TokenEvent) =>
                            e.forwardedByChild && c.isChild,

                        actions: sendParent((_, e) => e),
                    },
                ],
            },
        },
        done: {
            type: "final",
        },
    },
});

export default ProgramMachine;
