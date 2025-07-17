#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { fixCommand } from './commands/fix';
import pkg from '../package.json';

const program = new Command();

program
  .name('vtex-css-sanitizer')
  .description('Una CLI para limpiar clases CSS no usadas en proyectos VTEX IO')
  .version(pkg.version);

program
  .command('analyze')
  .description('Analiza el proyecto y muestra las clases CSS y blockClass no utilizadas')
  .argument('<path>', 'Ruta al directorio raíz del proyecto VTEX (ej: .)')
  .action(analyzeCommand);

program
  .command('fix')
  .description('Elimina las reglas CSS no utilizadas de los archivos')
  .argument('<path>', 'Ruta al directorio raíz del proyecto VTEX (ej: .)')
  .action(fixCommand);

program.parse(process.argv);
