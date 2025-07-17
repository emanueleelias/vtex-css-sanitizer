"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBlockClasses = extractBlockClasses;
const promises_1 = __importDefault(require("fs/promises"));
const jsonc_parser_1 = require("jsonc-parser");
/**
 * Recorre todos los archivos JSON/JSONC para extraer las declaraciones de `blockClass`.
 * @returns Un Map donde la clave es el valor de blockClass y el valor es dónde se encontró.
 */
async function extractBlockClasses(jsonFiles) {
    const declaredClasses = new Map();
    for (const filePath of jsonFiles) {
        try {
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            const parsedJson = (0, jsonc_parser_1.parse)(content);
            if (typeof parsedJson !== 'object' || parsedJson === null)
                continue;
            for (const blockName in parsedJson) {
                if (!Object.prototype.hasOwnProperty.call(parsedJson, blockName))
                    continue;
                const blockDef = parsedJson[blockName];
                const blockClassValue = blockDef?.props?.blockClass;
                let classesFound = [];
                if (typeof blockClassValue === 'string') {
                    classesFound = blockClassValue.split(' ').filter(Boolean);
                }
                else if (Array.isArray(blockClassValue)) {
                    classesFound = blockClassValue.filter(cls => typeof cls === 'string' && cls.length > 0);
                }
                if (classesFound.length > 0) {
                    for (const cls of classesFound) {
                        const locations = declaredClasses.get(cls) || [];
                        locations.push({ filePath, blockName });
                        declaredClasses.set(cls, locations);
                    }
                }
            }
        }
        catch (error) {
            console.error(`❌ Error procesando el archivo JSON ${filePath}:`, error);
        }
    }
    return declaredClasses;
}
