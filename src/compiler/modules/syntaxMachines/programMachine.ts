import {
    BaseActionObject,
    StateNodeConfig,
    createMachine,
    sendParent,
} from "xstate";
import { Token, TokenType } from "../lexicalAnalyzer";
import { SyntaxError } from "../syntacticAnalyzer";

import DeclarationMachine from "./declaration";
import LoopMachine from "./loop";

export type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
    state: string;
};

export type ChangeEvent = {
    type: string;
    state: string;
};

export type SyntaxContext = {};

export type SyntaxMachine = StateNodeConfig<
    SyntaxContext,
    any,
    TokenEvent,
    BaseActionObject
>;

export const raiseSyntaxError = (
    _: SyntaxContext,
    event: TokenEvent,
    message: string
) => {
    throw new SyntaxError(message, event.row, event.col);
};

function sendParentIfNecessary(context, event, meta) {
    if (!event) return;

    const e = {
        type: "CHILD_STATE_CHANGE",
        data: {
            state: "test",
        },
    };
    const sp = sendParent(e)(context, event, meta);
    console.log("sending to parent", e, sp);
    // if (context.isChild) {
    // }
    return sp;
}

const childOnDone = [
    {
        target: "done",
        cond: (c) => c.isChild,
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
        context: { isChild: false },
        events: {} as TokenEvent,
    },
    context: { isChild: false },
    states: {
        start: {
            on: {
                declara: "declaration",
                "\n": {},
                repite: "loop",
                fin: {},
                "*": [
                    {
                        // ignore EOFs
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(c, e, "Error, incompleto"),
                    },
                ],
            },
        },
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
        done: {
            type: "final",
        },
    },
});

export default ProgramMachine;
