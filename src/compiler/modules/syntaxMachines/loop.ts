import { assign, createMachine, send } from "xstate";
import { generateLoop } from "../jsCodegen";
import { assignScopeID, clearScopeSymbols } from "../utils";
import ProgramMachine, {
    TokenEvent,
    raiseSyntaxError,
    SyntaxMachineOnDone,
    ScopedContext,
} from "./programMachine";

interface LoopContext extends ScopedContext {
    instructionsString: string;
    iterations?: TokenEvent;
}

//@ts-ignore
const LoopMachine = createMachine({
    predictableActionArguments: true,
    id: "loop",
    initial: "expectNum",
    schema: {
        context: {} as LoopContext,
        events: {} as TokenEvent,
    },
    context: {
        instructionsString: "",
        scopeID: "",
    },
    states: {
        expectNum: {
            //@ts-ignore
            entry: assignScopeID,
            on: {
                "*": {
                    target: "expectVeces",
                    cond: (_, event: TokenEvent) =>
                        event.tokenType === "numberLiteral" ||
                        event.tokenType === "identifier",
                    actions: assign({
                        iterations: (_, e: TokenEvent) => e,
                    }),
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
                id: "programSubMachine",
                src: () => ProgramMachine,
                autoForward: true,
                data: {
                    isChild: true,
                    symbolTable: (c: LoopContext) => c.symbolTable,
                    scopeID: (c: LoopContext) => c.scopeID,
                },
                onDone: {
                    target: "expectInstrOrFin",
                    actions: assign({
                        instructionsString: (c, e: SyntaxMachineOnDone) => {
                            return c.instructionsString + e.data.result;
                        },
                    }),
                },
            },
            on: {
                "*": [
                    {
                        cond: (_, e) => e.forwardedByChild,
                        actions: send((_, e) => ({
                            ...e,
                            forwardedByChild: false,
                        })),
                    },
                ],
            },
        },
        expectInstrOrFin: {
            on: {
                fin: {
                    target: "done",
                },
                "\n": {},
                "*": [
                    {
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                        actions: (c, e) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Palabra faltante "fin" para terminar el ciclo`,
                                false
                            ),
                    },
                    // If it's anything other than "fin", "\n" or an eof
                    // forward the event to expectInstructions state
                    {
                        target: "instructions",
                        actions: send((_: any, event: TokenEvent) => event),
                    },
                ],
            },
        },
        done: {
            type: "final",
            data: (c, _) => {
                if (c.symbolTable === undefined)
                    throw new Error(
                        "Symbol table was not passed to loop machine."
                    );

                const result = {
                    result: generateLoop(
                        c.symbolTable,
                        c.iterations as TokenEvent,
                        c.instructionsString
                    ),
                };

                clearScopeSymbols(c);

                return result;
            },
        },
    },
});

export default LoopMachine;
