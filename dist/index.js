#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const analyze_1 = require("./commands/analyze");
const fix_1 = require("./commands/fix");
const package_json_1 = __importDefault(require("../package.json"));
const program = new commander_1.Command();
program
    .name('vtex-css-sanitizer')
    .description('Una CLI para limpiar clases CSS no usadas en proyectos VTEX IO')
    .version(package_json_1.default.version);
program
    .command('analyze')
    .description('Analiza el proyecto y muestra las clases CSS y blockClass no utilizadas')
    .argument('<path>', 'Ruta al directorio raíz del proyecto VTEX (ej: .)')
    .action(analyze_1.analyzeCommand);
program
    .command('fix')
    .description('Elimina las reglas CSS no utilizadas de los archivos')
    .argument('<path>', 'Ruta al directorio raíz del proyecto VTEX (ej: .)')
    .action(fix_1.fixCommand);
program.parse(process.argv);
