"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCamelCase = toCamelCase;
exports.generateCssSelector = generateCssSelector;
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
// Esta función tomaría el nombre del bloque y la blockClass y devolvería el selector esperado.
function generateCssSelector(blockName, blockClass) {
    // Extraemos el componente principal del nombre del bloque
    const component = blockName.split('#')[0];
    const handle = toCamelCase(component.replace(/\./g, '-')); // 'flex-layout.row' -> 'flex-layout-row' -> 'flexLayoutRow'
    // VTEX suele usar dos guiones para separar el handle de la blockClass
    return `.${handle}--${blockClass}`;
}
