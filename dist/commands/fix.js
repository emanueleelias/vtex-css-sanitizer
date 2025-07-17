"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixCommand = fixCommand;
const file_finder_1 = require("../utils/file-finder");
const json_processor_1 = require("../utils/json-processor");
const css_processor_1 = require("../utils/css-processor");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const postcss_1 = __importDefault(require("postcss"));
const prompts_1 = __importDefault(require("prompts"));
const report_generator_1 = require("../utils/report-generator");
async function fixCommand(projectPath) {
    console.log(`\n🔧 Iniciando proceso de limpieza interactiva en: ${path_1.default.resolve(projectPath)}`);
    // --- 1. Análisis (sin cambios) ---
    const jsonFiles = (0, file_finder_1.findJsonFiles)(projectPath);
    const cssFiles = (0, file_finder_1.findCssFiles)(projectPath);
    const declaredBlockClassesMap = await (0, json_processor_1.extractBlockClasses)(jsonFiles);
    const usedCssSuffixesMap = await (0, css_processor_1.extractCssSuffixes)(cssFiles);
    const declaredBlockClasses = new Set(declaredBlockClassesMap.keys());
    const usedCssSuffixes = new Set(usedCssSuffixesMap.keys());
    const unusedSuffixes = new Set([...usedCssSuffixes].filter(suffix => !declaredBlockClasses.has(suffix)));
    if (unusedSuffixes.size === 0) {
        console.log('\n✅ ¡Genial! No se encontraron reglas CSS para eliminar. ¡El proyecto ya está limpio!');
        return;
    }
    console.log(`\n🔎 Se han encontrado reglas CSS con sufijos potencialmente no utilizados. Vamos a revisarlas una por una.`);
    console.log('------------------------------------------------------------------');
    const deletedRules = [];
    const keptRules = [];
    let totalRulesRemoved = 0;
    // --- 2. Procesamiento Interactivo con CONTADOR ---
    const totalFiles = cssFiles.length;
    for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
        const filePath = cssFiles[fileIndex];
        const originalContent = await promises_1.default.readFile(filePath, 'utf-8');
        const root = postcss_1.default.parse(originalContent);
        const candidates = (0, css_processor_1.identifyRulesForDeletion)(root, unusedSuffixes);
        if (candidates.length === 0) {
            continue;
        }
        let rulesRemovedInFile = 0;
        for (let i = 0; i < candidates.length; i++) {
            const rule = candidates[i];
            const relativePath = path_1.default.relative(projectPath, filePath);
            const ruleAsString = rule.toString();
            console.clear();
            // Se muestra el progreso general y el del archivo actual
            console.log(`[ Progreso: Archivo ${fileIndex + 1} de ${totalFiles} ]`);
            console.log(`------------------------------------------------------------------`);
            console.log(`Revisando Archivo: ${relativePath}`);
            console.log(`Candidato ${i + 1} de ${candidates.length}`);
            console.log('------------------------------------------------------------------');
            console.log('Se encontró la siguiente regla CSS que podría no estar en uso:');
            console.log('\n\x1b[33m%s\x1b[0m', ruleAsString);
            const response = await (0, prompts_1.default)({
                type: 'confirm',
                name: 'shouldDelete',
                message: '¿Deseas eliminar esta regla CSS?',
                initial: true
            });
            if (response.shouldDelete === undefined) {
                console.log('\n🛑 Proceso de limpieza cancelado por el usuario.');
                // Antes de salir, generamos el informe con lo que se haya hecho hasta ahora
                if (deletedRules.length > 0 || keptRules.length > 0) {
                    await (0, report_generator_1.generateFixReport)(projectPath, deletedRules, keptRules);
                    console.log(`\n📄 Informe parcial de limpieza guardado.`);
                }
                return;
            }
            if (response.shouldDelete) {
                rule.remove();
                rulesRemovedInFile++;
                deletedRules.push({ rule: ruleAsString, filePath });
                console.log('\x1b[31m%s\x1b[0m', '🗑️  Regla eliminada.');
            }
            else {
                keptRules.push({ rule: ruleAsString, filePath });
                console.log('\x1b[32m%s\x1b[0m', '👍  Regla conservada.');
            }
            console.log('------------------------------------------------------------------');
        }
        if (rulesRemovedInFile > 0) {
            const newContent = root.toString();
            await promises_1.default.writeFile(filePath, newContent, 'utf-8');
            console.log(`\n💾 Se guardaron los cambios en ${path_1.default.relative(projectPath, filePath)}. Se eliminaron ${rulesRemovedInFile} reglas.`);
            totalRulesRemoved += rulesRemovedInFile;
            await (0, prompts_1.default)({ type: 'invisible', name: 'continue', message: 'Presiona Enter para continuar con el siguiente archivo...' });
        }
    }
    console.clear();
    if (totalRulesRemoved > 0) {
        console.log(`\n✅ Proceso completado. Se eliminaron un total de ${totalRulesRemoved} reglas CSS.`);
    }
    else {
        console.log(`\n✅ Proceso completado. No se realizó ninguna eliminación.`);
    }
    if (deletedRules.length > 0 || keptRules.length > 0) {
        try {
            const reportPath = await (0, report_generator_1.generateFixReport)(projectPath, deletedRules, keptRules);
            console.log(`\n📄 Informe de limpieza guardado en: ${path_1.default.relative(projectPath, reportPath)}`);
        }
        catch (error) {
            console.error('\n❌ Ocurrió un error al guardar el informe de limpieza:', error);
        }
    }
}
