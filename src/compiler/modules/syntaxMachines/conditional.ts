import { createMachine } from "xstate";
import { TokenEvent, raiseSyntaxError, SyntaxContext } from "./programMachine";

const conditionalMachine = createMachine({
    predictableActionArguments: true,
    id: "conditional",
    initial: "expectCondition",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        expectCondition: {},
        done: {
            type: "final",
        },
    },
});

export default conditionalMachine;
