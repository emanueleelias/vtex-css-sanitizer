import fs from 'fs/promises';
import { parse } from 'jsonc-parser';

export interface BlockClassLocation {
  filePath: string;
  blockName: string;
}

/**
 * Recorre todos los archivos JSON/JSONC para extraer las declaraciones de `blockClass`.
 * @returns Un Map donde la clave es el valor de blockClass y el valor es dónde se encontró.
 */
export async function extractBlockClasses(jsonFiles: string[]): Promise<Map<string, BlockClassLocation[]>> {
  const declaredClasses = new Map<string, BlockClassLocation[]>();

  for (const filePath of jsonFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsedJson = parse(content);

      if (typeof parsedJson !== 'object' || parsedJson === null) continue;

      for (const blockName in parsedJson) {
        if (!Object.prototype.hasOwnProperty.call(parsedJson, blockName)) continue;

        const blockDef = parsedJson[blockName];
        const blockClassValue = blockDef?.props?.blockClass;

        let classesFound: string[] = [];

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
    } catch (error) {
      console.error(`❌ Error procesando el archivo JSON ${filePath}:`, error);
    }
  }

  return declaredClasses;
}
