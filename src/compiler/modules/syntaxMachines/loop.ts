import { createMachine } from "xstate";
import ProgramMachine, {
    TokenEvent,
    raiseSyntaxError,
    SyntaxContext,
} from "./programMachine";

const LoopMachine = createMachine({
    predictableActionArguments: true,
    id: "loop",
    initial: "expectNum",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        expectNum: {
            on: {
                "*": {
                    target: "expectVeces",
                    cond: (_, event: TokenEvent) =>
                        event.tokenType === "numberLiteral" ||
                        event.tokenType === "identifier",
                },
            },
        },
        expectVeces: {
            on: {
                veces: {
                    target: "instructions",
                },
            },
        },
        instructions: {
            invoke: {
                src: () => ProgramMachine,
                autoForward: true,
            },
            on: {
                fin: "done",
                "*": [
                    {
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                        actions: (c, e) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Palabra faltante "fin" para terminar el ciclo`
                            ),
                    },
                ],
            },
        },
        done: {
            type: "final",
        },
    },
});

export default LoopMachine;
