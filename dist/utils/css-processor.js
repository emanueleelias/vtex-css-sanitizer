"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCssSuffixes = extractCssSuffixes;
exports.identifyRulesForDeletion = identifyRulesForDeletion;
const promises_1 = __importDefault(require("fs/promises"));
const postcss_1 = __importDefault(require("postcss"));
const VTEX_CLASS_REGEX = /\.([\w-]+(?:--[\w-]+)+)/g;
function getPrimarySuffix(vtexClassName) {
    const parts = vtexClassName.split('--');
    if (parts.length > 1) {
        return parts[1];
    }
    return null;
}
async function extractCssSuffixes(cssFiles) {
    const usedSuffixes = new Map();
    for (const filePath of cssFiles) {
        try {
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            const root = postcss_1.default.parse(content);
            root.walkRules(rule => {
                rule.selectors.forEach(selector => {
                    const matches = [...selector.matchAll(VTEX_CLASS_REGEX)];
                    for (const match of matches) {
                        const fullClassName = match[0].substring(1);
                        const primarySuffix = getPrimarySuffix(fullClassName);
                        if (primarySuffix) {
                            const locations = usedSuffixes.get(primarySuffix) || [];
                            locations.push({ filePath, selector });
                            usedSuffixes.set(primarySuffix, locations);
                        }
                    }
                });
            });
        }
        catch (error) {
            console.error(`❌ Error procesando el archivo CSS ${filePath}:`, error);
        }
    }
    return usedSuffixes;
}
/**
 * Identifica todas las reglas de CSS que son candidatas a ser eliminadas.
 * No las elimina, solo las devuelve para su procesamiento interactivo.
 */
function identifyRulesForDeletion(root, unusedSuffixes) {
    const candidates = [];
    root.walkRules(rule => {
        const ruleSelectors = rule.selectors;
        let allSelectorsAreUnused = ruleSelectors.length > 0;
        for (const selector of ruleSelectors) {
            const matches = [...selector.matchAll(VTEX_CLASS_REGEX)];
            if (matches.length === 0) {
                allSelectorsAreUnused = false;
                break;
            }
            const hasAtLeastOneUsedSuffix = matches.some(match => {
                const primarySuffix = getPrimarySuffix(match[0].substring(1));
                return primarySuffix && !unusedSuffixes.has(primarySuffix);
            });
            if (hasAtLeastOneUsedSuffix) {
                allSelectorsAreUnused = false;
                break;
            }
        }
        if (allSelectorsAreUnused) {
            candidates.push(rule);
        }
    });
    return candidates;
}
