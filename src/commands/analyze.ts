import { findJsonFiles, findCssFiles } from '../utils/file-finder';
import { extractBlockClasses } from '../utils/json-processor';
import { extractCssSuffixes } from '../utils/css-processor';
import { generateAnalysisReport } from '../utils/report-generator';
import path from 'path';

export async function analyzeCommand(projectPath: string) {
  console.log(`\n🔍 Iniciando análisis en: ${path.resolve(projectPath)}`);
  // 1. Encontrar todos los archivos relevantes
  const jsonFiles = findJsonFiles(projectPath);
  const cssFiles = findCssFiles(projectPath);

  if (jsonFiles.length === 0 || cssFiles.length === 0) {
    console.error('❌ Error: No se encontraron archivos de store o styles/css. Asegúrate de que la ruta es correcta.');
    return;
  }

  console.log(`   - Encontrados ${jsonFiles.length} archivos de bloques (.jsonc, .json)`);
  console.log(`   - Encontrados ${cssFiles.length} archivos de estilos (.css)`);

  // 2. Extraer la información
  const declaredBlockClassesMap = await extractBlockClasses(jsonFiles);
  const usedCssSuffixesMap = await extractCssSuffixes(cssFiles);

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
      locations.slice(0, 3).forEach(loc => { // Muestra hasta 3 ejemplos
        console.log(`    └─ Usado en: ${path.relative(projectPath, loc.filePath)} (selector: "${loc.selector}")`);
      });
    });
    console.log("\n   Estos estilos podrían ser eliminados. Usa el comando 'fix' para limpiarlos.");
  } else {
    console.log(`\n✅ ¡Genial! Todos los sufijos CSS utilizados corresponden a una 'blockClass' declarada.`);
  }

  console.log('\n---------------------------------');

  if (unusedBlockClasses.length > 0) {
    console.log(`\n🟡 Se encontraron ${unusedBlockClasses.length} 'blockClass' declaradas que NO se usan en ningún archivo CSS:`);
    unusedBlockClasses.forEach(cls => {
      const locations = declaredBlockClassesMap.get(cls) || [];
      console.log(`\n  - blockClass: "${cls}"`);
      locations.slice(0, 3).forEach(loc => {
        console.log(`    └─ Declarada en: ${path.relative(projectPath, loc.filePath)} (en el bloque: "${loc.blockName}")`);
      });
    });
    console.log("\n   Estas declaraciones son inútiles y pueden ser eliminadas de los archivos .jsonc/.json.");
  } else {
    console.log(`\n✅ ¡Excelente! Todas las 'blockClass' declaradas tienen reglas CSS asociadas.`);
  }

  console.log('\n--- ANÁLISIS COMPLETADO ---\n');
  try {
    const reportPath = await generateAnalysisReport(
      projectPath,
      unusedCss,
      unusedBlockClasses,
      usedCssSuffixesMap,
      declaredBlockClassesMap
    );
    console.log(`\n📄 Informe de análisis guardado en: ${path.relative(projectPath, reportPath)}`);
  } catch (error) {
    console.error('\n❌ Ocurrió un error al guardar el informe de análisis:', error);
  }
}
