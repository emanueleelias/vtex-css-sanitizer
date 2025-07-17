"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findJsonFiles = findJsonFiles;
exports.findCssFiles = findCssFiles;
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
/**
 * Encuentra todos los archivos .json y .jsonc en la carpeta /store.
 */
function findJsonFiles(projectPath) {
    const storePath = path_1.default.join(projectPath, 'store');
    return (0, glob_1.sync)(`${storePath}/**/*.{json,jsonc}`);
}
/**
 * Encuentra todos los archivos .css DE APPS NATIVAS (vtex.*) en la carpeta /styles/css.
 * Omite los archivos de CSS de componentes custom para evitar falsos positivos.
 */
function findCssFiles(projectPath) {
    const stylesPath = path_1.default.join(projectPath, 'styles/css');
    const allCssFiles = (0, glob_1.sync)(`${stylesPath}/**/*.css`);
    const nativeVtexCssFiles = allCssFiles.filter(filePath => {
        const fileName = path_1.default.basename(filePath);
        return fileName.startsWith('vtex.');
    });
    return nativeVtexCssFiles;
}
