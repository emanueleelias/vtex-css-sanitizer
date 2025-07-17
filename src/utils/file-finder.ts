import { sync as globSync } from 'glob';
import path from 'path';

/**
 * Encuentra todos los archivos .json y .jsonc en la carpeta /store.
 */
export function findJsonFiles(projectPath: string): string[] {
  const storePath = path.join(projectPath, 'store');
  return globSync(`${storePath}/**/*.{json,jsonc}`);
}

/**
 * Encuentra todos los archivos .css DE APPS NATIVAS (vtex.*) en la carpeta /styles/css.
 * Omite los archivos de CSS de componentes custom para evitar falsos positivos.
 */
export function findCssFiles(projectPath: string): string[] {
  const stylesPath = path.join(projectPath, 'styles/css');
  const allCssFiles = globSync(`${stylesPath}/**/*.css`);

  const nativeVtexCssFiles = allCssFiles.filter(filePath => {
    const fileName = path.basename(filePath);
    return fileName.startsWith('vtex.');
  });

  return nativeVtexCssFiles;
}
