const initialProgram = `
declara i asigna 1

repite 20 veces
    declara modulo3 asigna i modulo 3
    declara modulo5 asigna i modulo 5

    muestra(i)
    si modulo3 igual que 0 y modulo5 igual que 0 entonces
        muestra("Fizz Buzz")
    fin
    si no pero modulo3 igual que 0 entonces
        muestra("Fizz")
    fin
    si no pero modulo5 igual que 0 entonces
        muestra("Buzz")
    fin

    i asigna i mas 1
fin
`;

export default {
    name: "untitled.icp",
    language: "icp",
    value: initialProgram.trim(),
};
