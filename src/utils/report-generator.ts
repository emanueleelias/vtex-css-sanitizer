import fs from 'fs/promises';
import path from 'path';
import { BlockClassLocation } from './json-processor';
import { CssSuffixLocation } from './css-processor';

// --- Helper para crear el directorio de informes ---
async function ensureReportDirectory(projectPath: string): Promise<string> {
  const reportDir = path.join(projectPath, '.sanitizer-reports');
  await fs.mkdir(reportDir, { recursive: true }); // recursive: true evita errores si el dir ya existe
  return reportDir;
}

// --- Helper para obtener la fecha en formato YYYY-MM-DD ---
function getFormattedDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Generador para el informe de 'analyze' ---
export async function generateAnalysisReport(
  projectPath: string,
  unusedCss: string[],
  unusedBlockClasses: string[],
  usedCssSuffixesMap: Map<string, CssSuffixLocation[]>,
  declaredBlockClassesMap: Map<string, BlockClassLocation[]>
): Promise<string> {
  const reportDir = await ensureReportDirectory(projectPath);
  const reportPath = path.join(reportDir, `analysis-report-${getFormattedDate()}.md`);

  let markdownContent = `# ✅ Informe de Análisis de CSS - ${getFormattedDate()}\n\n`;
  markdownContent += `Este informe detalla las clases CSS y declaraciones \`blockClass\` que podrían estar sin uso en el proyecto.\n\n`;
  markdownContent += `--- \n\n`;

  // Sección 1: CSS sin uso
  markdownContent += `## 🔴 Sufijos CSS sin \`blockClass\` correspondiente (${unusedCss.length} encontrados)\n\n`;
  if (unusedCss.length > 0) {
    unusedCss.forEach(suffix => {
      markdownContent += `### \`--${suffix}\`\n\n`;
      const locations = usedCssSuffixesMap.get(suffix) || [];
      locations.slice(0, 5).forEach(loc => {
        markdownContent += `*   **Usado en:** \`${path.relative(projectPath, loc.filePath)}\`\n`;
        markdownContent += `*   **Selector:** \`${loc.selector}\`\n\n`;
      });
    });
  } else {
    markdownContent += `¡Excelente! No se encontraron sufijos CSS sin uso.\n\n`;
  }

  markdownContent += `--- \n\n`;

  // Sección 2: blockClass sin uso
  markdownContent += `## 🟡 \`blockClass\` sin estilos CSS asociados (${unusedBlockClasses.length} encontrados)\n\n`;
  if (unusedBlockClasses.length > 0) {
    unusedBlockClasses.forEach(cls => {
      markdownContent += `### \`"${cls}"\`\n\n`;
      const locations = declaredBlockClassesMap.get(cls) || [];
      locations.slice(0, 5).forEach(loc => {
        markdownContent += `*   **Declarado en:** \`${path.relative(projectPath, loc.filePath)}\`\n`;
        markdownContent += `*   **Bloque:** \`${loc.blockName}\`\n\n`;
      });
    });
  } else {
    markdownContent += `¡Genial! Todas las \`blockClass\` declaradas se están utilizando.\n\n`;
  }

  await fs.writeFile(reportPath, markdownContent);
  return reportPath;
}

export interface FixReportEntry {
  rule: string;
  filePath: string;
}

export async function generateFixReport(
  projectPath: string,
  deletedRules: FixReportEntry[],
  keptRules: FixReportEntry[]
): Promise<string> {
  const reportDir = await ensureReportDirectory(projectPath);
  const reportPath = path.join(reportDir, `fix-report-${getFormattedDate()}.md`);

  let markdownContent = `# 🛠️ Informe de Limpieza de CSS - ${getFormattedDate()}\n\n`;
  markdownContent += `Este informe detalla las acciones realizadas durante el proceso de limpieza interactiva.\n\n`;
  markdownContent += `--- \n\n`;

  // Sección 1: Reglas eliminadas
  markdownContent += `## 🗑️ Reglas Eliminadas (${deletedRules.length})\n\n`;
  if (deletedRules.length > 0) {
    deletedRules.forEach(entry => {
      markdownContent += `*   **Archivo:** \`${path.relative(projectPath, entry.filePath)}\`\n`;
      markdownContent += `    \`\`\`css\n    ${entry.rule}\n    \`\`\`\n\n`;
    });
  } else {
    markdownContent += `No se eliminó ninguna regla durante esta sesión.\n\n`;
  }

  markdownContent += `--- \n\n`;

  // Sección 2: Reglas conservadas
  markdownContent += `## 👍 Reglas Conservadas por el Usuario (${keptRules.length})\n\n`;
  if (keptRules.length > 0) {
    keptRules.forEach(entry => {
      markdownContent += `*   **Archivo:** \`${path.relative(projectPath, entry.filePath)}\`\n`;
      markdownContent += `    \`\`\`css\n    ${entry.rule}\n    \`\`\`\n\n`;
    });
  } else {
    markdownContent += `No se conservó ninguna regla candidata durante esta sesión.\n\n`;
  }

  await fs.writeFile(reportPath, markdownContent);
  return reportPath;
}
