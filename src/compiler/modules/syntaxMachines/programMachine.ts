import { createMachine, send, sendParent } from "xstate";
import { TokenType } from "../lexicalAnalyzer";
import { SyntaxError } from "../syntacticAnalyzer";
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
    // predictableActionArguments: true,
    id: "program",
    initial: "start",
    schema: {
        context: { isChild: false } as ProgramMachineContext,
        events: {} as TokenEvent,
    },
    context: { isChild: false },
    states: {
        start: {
            entry: () => console.log("entered program start"),
            on: {
                declara: "declaration",
                "\n": {},
                repite: "loop",
                si: "conditional",
                fin: [
                    {
                        // Forward "fin" to parent in case it we're in
                        // an empty conditional or loop
                        // Also check that we haven't already forwarded it
                        cond: (c, e) => c.isChild && !e.forwardedByChild,
                        actions: [
                            (c, e) =>
                                console.log("sending fin to parent", c, e),
                            sendParent((_, e) => ({
                                ...e,
                                forwardedByChild: true,
                            })),
                        ],
                    },
                ],
                "*": [
                    {
                        // ignore EOFs
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                    },
                    // If its not a child, and event is forwarded
                    // forward event to itself (this machine)
                    // {
                    //     cond: (c: ProgramMachineContext, e: TokenEvent) =>
                    //         e.forwardedByChild,
                    //     actions: [
                    //         send((_, e) => e),
                    //         (c, e) => console.log("forwarding to self", e, c),
                    //     ],
                    // },
                    {
                        actions: [
                            (c, e) => console.log("idk token", e),
                            (c: ProgramMachineContext, e: TokenEvent) =>
                                raiseSyntaxError(c, e, "Token no esperado"),
                        ],
                    },
                ],
            },
        },
        declaration: {
            entry: () => console.log("entered program declaration"),
            invoke: {
                src: DeclarationMachine,
                autoForward: true,
                onDone: childOnDone,
            },
        },
        loop: {
            entry: () => console.log("entered program loop"),
            invoke: {
                src: LoopMachine,
                autoForward: true,
                onDone: childOnDone,
            },
        },
        conditional: {
            entry: () => console.log("entered program conditional"),
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
                        cond: (c: ProgramMachineContext, e: TokenEvent) => {
                            const cond = e.forwardedByChild && c.isChild;

                            console.log("got", e, "will forward?", cond, c);
                            return cond;
                        },

                        actions: [
                            (c, e, m) =>
                                console.log("sending to parent", e, c, m),
                            sendParent((_, e) => e),
                        ],
                    },

                    // If child forwarded something to this machine, resend it
                    {
                        cond: (_,e) => e.forwardedByChild,
                        actions: send((_, e) => e)
                    }
                ],
            },
        },
        done: {
            type: "final",
        },
    },
});

export default ProgramMachine;
