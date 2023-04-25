const initialProgram = `
## Bienvenid@ a Idiom!

# Fizz Buzz!
declara i asigna 1

repite 20 veces
    # 0 si es divisible entre 3
    declara modulo3 asigna i modulo 3
    # 0 si es divisible entre 5
    declara modulo5 asigna i modulo 5

    si modulo3 igual que 0 y modulo5 igual que 0 entonces
        muestra("Fizz Buzz")
    fin
    si no pero modulo3 igual que 0 entonces
        muestra("Fizz")
    fin
    si no pero modulo5 igual que 0 entonces
        muestra("Buzz")
    fin
    si no entonces
        muestra(i)
    fin

    # incrementa i
    i asigna i mas 1
fin
`;

export default {
    name: "untitled.icp",
    language: "icp",
    value: initialProgram.trim(),
};
