const removeComments = (program: string): string => {
    const lines = program.split("\n");
    let output = "";

    for (let i = 0; i < lines.length; i++) {
        let quotes = 0;
        for (let j = 0; j < lines[i].length; j++) {
            if (lines[i][j] === "#" && quotes % 2 === 0) break;

            if (lines[i][j] === '"' || lines[i][j] === "'") quotes++;
            output += lines[i][j];
        }
        output += "\n";
    }

    return output;
};

export default class Preprocessor {
    modules = [removeComments];

    run(program: string): string {
        let output = program;
        this.modules.forEach((m) => {
            output = m(output);
        });

        return output;
    }
}
