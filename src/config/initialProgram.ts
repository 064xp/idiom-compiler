const initialProgram = `
# Bienvenido!
declara texto asigna "Hola Mundo!"
declara num1 asigna 2
declara num2 asigna 5
declara num3

si num1 es mayor que num2 entonces
  num3 asigna num1 mas num2
si no entonces
  num3 asigna num1 por num2

repite num3 veces:
  muestra(texto)
`;

export default {
  name: "untitled.icp",
  language: "icp",
  value: initialProgram.trim(),
};
