import { findJsonFiles, findCssFiles } from '../utils/file-finder';
import { extractBlockClasses } from '../utils/json-processor';
import { extractCssSuffixes, identifyRulesForDeletion } from '../utils/css-processor';
import path from 'path';
import fs from 'fs/promises';
import postcss from 'postcss';
import prompts from 'prompts';
import { generateFixReport, FixReportEntry } from '../utils/report-generator';

export async function fixCommand(projectPath: string) {
  console.log(`\n🔧 Iniciando proceso de limpieza interactiva en: ${path.resolve(projectPath)}`);

  // --- 1. Análisis (sin cambios) ---
  const jsonFiles = findJsonFiles(projectPath);
  const cssFiles = findCssFiles(projectPath);

  const declaredBlockClassesMap = await extractBlockClasses(jsonFiles);
  const usedCssSuffixesMap = await extractCssSuffixes(cssFiles);

  const declaredBlockClasses = new Set(declaredBlockClassesMap.keys());
  const usedCssSuffixes = new Set(usedCssSuffixesMap.keys());
  const unusedSuffixes = new Set([...usedCssSuffixes].filter(suffix => !declaredBlockClasses.has(suffix)));

  if (unusedSuffixes.size === 0) {
    console.log('\n✅ ¡Genial! No se encontraron reglas CSS para eliminar. ¡El proyecto ya está limpio!');
    return;
  }

  console.log(`\n🔎 Se han encontrado reglas CSS con sufijos potencialmente no utilizados. Vamos a revisarlas una por una.`);
  console.log('------------------------------------------------------------------');

  const deletedRules: FixReportEntry[] = [];
  const keptRules: FixReportEntry[] = [];
  let totalRulesRemoved = 0;

  // --- 2. Procesamiento Interactivo con CONTADOR ---
  const totalFiles = cssFiles.length;
  for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
    const filePath = cssFiles[fileIndex];
    const originalContent = await fs.readFile(filePath, 'utf-8');
    const root = postcss.parse(originalContent);

    const candidates = identifyRulesForDeletion(root, unusedSuffixes);

    if (candidates.length === 0) {
      continue;
    }

    let rulesRemovedInFile = 0;
    for (let i = 0; i < candidates.length; i++) {
      const rule = candidates[i];
      const relativePath = path.relative(projectPath, filePath);
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

      const response = await prompts({
        type: 'confirm',
        name: 'shouldDelete',
        message: '¿Deseas eliminar esta regla CSS?',
        initial: true
      });

      if (response.shouldDelete === undefined) {
        console.log('\n🛑 Proceso de limpieza cancelado por el usuario.');
        // Antes de salir, generamos el informe con lo que se haya hecho hasta ahora
        if (deletedRules.length > 0 || keptRules.length > 0) {
          await generateFixReport(projectPath, deletedRules, keptRules);
          console.log(`\n📄 Informe parcial de limpieza guardado.`);
        }
        return;
      }

      if (response.shouldDelete) {
        rule.remove();
        rulesRemovedInFile++;
        deletedRules.push({ rule: ruleAsString, filePath });
        console.log('\x1b[31m%s\x1b[0m', '🗑️  Regla eliminada.');
      } else {
        keptRules.push({ rule: ruleAsString, filePath });
        console.log('\x1b[32m%s\x1b[0m', '👍  Regla conservada.');
      }
      console.log('------------------------------------------------------------------');
    }

    if (rulesRemovedInFile > 0) {
      const newContent = root.toString();
      await fs.writeFile(filePath, newContent, 'utf-8');
      console.log(`\n💾 Se guardaron los cambios en ${path.relative(projectPath, filePath)}. Se eliminaron ${rulesRemovedInFile} reglas.`);
      totalRulesRemoved += rulesRemovedInFile;
      await prompts({ type: 'invisible', name: 'continue', message: 'Presiona Enter para continuar con el siguiente archivo...' });
    }
  }

  console.clear();
  if (totalRulesRemoved > 0) {
    console.log(`\n✅ Proceso completado. Se eliminaron un total de ${totalRulesRemoved} reglas CSS.`);
  } else {
    console.log(`\n✅ Proceso completado. No se realizó ninguna eliminación.`);
  }

  if (deletedRules.length > 0 || keptRules.length > 0) {
    try {
      const reportPath = await generateFixReport(projectPath, deletedRules, keptRules);
      console.log(`\n📄 Informe de limpieza guardado en: ${path.relative(projectPath, reportPath)}`);
    } catch (error) {
      console.error('\n❌ Ocurrió un error al guardar el informe de limpieza:', error);
    }
  }
}

