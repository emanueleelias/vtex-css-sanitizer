"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCommand = analyzeCommand;
const file_finder_1 = require("../utils/file-finder");
const json_processor_1 = require("../utils/json-processor");
const css_processor_1 = require("../utils/css-processor");
const report_generator_1 = require("../utils/report-generator");
const path_1 = __importDefault(require("path"));
async function analyzeCommand(projectPath) {
    console.log(`\n🔍 Iniciando análisis en: ${path_1.default.resolve(projectPath)}`);
    // 1. Encontrar todos los archivos relevantes
    const jsonFiles = (0, file_finder_1.findJsonFiles)(projectPath);
    const cssFiles = (0, file_finder_1.findCssFiles)(projectPath);
    if (jsonFiles.length === 0 || cssFiles.length === 0) {
        console.error('❌ Error: No se encontraron archivos de store o styles/css. Asegúrate de que la ruta es correcta.');
        return;
    }
    console.log(`   - Encontrados ${jsonFiles.length} archivos de bloques (.jsonc, .json)`);
    console.log(`   - Encontrados ${cssFiles.length} archivos de estilos (.css)`);
    // 2. Extraer la información
    const declaredBlockClassesMap = await (0, json_processor_1.extractBlockClasses)(jsonFiles);
    const usedCssSuffixesMap = await (0, css_processor_1.extractCssSuffixes)(cssFiles);
    const declaredBlockClasses = new Set(declaredBlockClassesMap.keys());
    const usedCssSuffixes = new Set(usedCssSuffixesMap.keys());
    console.log(`\n📊 Análisis de datos:`);
    console.log(`   - ${declaredBlockClasses.size} 'blockClass' únicas declaradas.`);
    console.log(`   - ${usedCssSuffixes.size} sufijos de CSS únicos encontrados.`);
    // 3. Comparar y encontrar discrepancias
    // --- CSS sin uso ---
    const unusedCss = [...usedCssSuffixes].filter(suffix => !declaredBlockClasses.has(suffix));
    // --- blockClass sin uso ---
    const unusedBlockClasses = [...declaredBlockClasses].filter(cls => !usedCssSuffixes.has(cls));
    console.log('\n--- INFORME DE RESULTADOS ---');
    if (unusedCss.length > 0) {
        console.log(`\n🔴 Se encontraron ${unusedCss.length} SUFIJOS CSS que no corresponden a ninguna 'blockClass' declarada:`);
        unusedCss.forEach(suffix => {
            const locations = usedCssSuffixesMap.get(suffix) || [];
            console.log(`\n  - Sufijo: --${suffix}`);
            locations.slice(0, 3).forEach(loc => {
                console.log(`    └─ Usado en: ${path_1.default.relative(projectPath, loc.filePath)} (selector: "${loc.selector}")`);
            });
        });
        console.log("\n   Estos estilos podrían ser eliminados. Usa el comando 'fix' para limpiarlos.");
    }
    else {
        console.log(`\n✅ ¡Genial! Todos los sufijos CSS utilizados corresponden a una 'blockClass' declarada.`);
    }
    console.log('\n---------------------------------');
    if (unusedBlockClasses.length > 0) {
        console.log(`\n🟡 Se encontraron ${unusedBlockClasses.length} 'blockClass' declaradas que NO se usan en ningún archivo CSS:`);
        unusedBlockClasses.forEach(cls => {
            const locations = declaredBlockClassesMap.get(cls) || [];
            console.log(`\n  - blockClass: "${cls}"`);
            locations.slice(0, 3).forEach(loc => {
                console.log(`    └─ Declarada en: ${path_1.default.relative(projectPath, loc.filePath)} (en el bloque: "${loc.blockName}")`);
            });
        });
        console.log("\n   Estas declaraciones son inútiles y pueden ser eliminadas de los archivos .jsonc/.json.");
    }
    else {
        console.log(`\n✅ ¡Excelente! Todas las 'blockClass' declaradas tienen reglas CSS asociadas.`);
    }
    console.log('\n--- ANÁLISIS COMPLETADO ---\n');
    try {
        const reportPath = await (0, report_generator_1.generateAnalysisReport)(projectPath, unusedCss, unusedBlockClasses, usedCssSuffixesMap, declaredBlockClassesMap);
        console.log(`\n📄 Informe de análisis guardado en: ${path_1.default.relative(projectPath, reportPath)}`);
    }
    catch (error) {
        console.error('\n❌ Ocurrió un error al guardar el informe de análisis:', error);
    }
}
