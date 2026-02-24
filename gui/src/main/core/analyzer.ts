import path from 'path'
import fs from 'fs/promises'
import postcss from 'postcss'
import { findJsonFiles, findCssFiles } from './file-finder'
import { extractBlockClasses } from './json-processor'
import { extractCssSuffixes, identifyRulesForDeletion } from './css-processor'
import { generateAnalysisReport, generateFixReport } from './report-generator'
import type {
    AnalysisResult,
    RuleCandidate,
    FixResult,
    UnusedCssEntry,
    UnusedBlockClassEntry
} from './types'

/**
 * Analiza un proyecto VTEX IO y devuelve los resultados estructurados.
 */
export async function analyzeProject(projectPath: string): Promise<AnalysisResult> {
    const jsonFiles = findJsonFiles(projectPath)
    const cssFiles = findCssFiles(projectPath)

    if (jsonFiles.length === 0 && cssFiles.length === 0) {
        return {
            unusedCss: [],
            unusedBlockClasses: [],
            stats: { jsonFiles: 0, cssFiles: 0, uniqueBlockClasses: 0, uniqueCssSuffixes: 0 }
        }
    }

    const declaredBlockClassesMap = await extractBlockClasses(jsonFiles)
    const usedCssSuffixesMap = await extractCssSuffixes(cssFiles)

    const declaredBlockClasses = new Set(declaredBlockClassesMap.keys())
    const usedCssSuffixes = new Set(usedCssSuffixesMap.keys())

    // CSS sin blockClass
    const unusedCssSuffixes = [...usedCssSuffixes].filter(
        (suffix) => !declaredBlockClasses.has(suffix)
    )
    const unusedCss: UnusedCssEntry[] = unusedCssSuffixes.map((suffix) => ({
        suffix,
        locations: (usedCssSuffixesMap.get(suffix) || []).map((loc) => ({
            filePath: path.relative(projectPath, loc.filePath),
            selector: loc.selector
        }))
    }))

    // blockClass sin CSS
    const unusedBlockClassNames = [...declaredBlockClasses].filter(
        (cls) => !usedCssSuffixes.has(cls)
    )
    const unusedBlockClasses: UnusedBlockClassEntry[] = unusedBlockClassNames.map((cls) => ({
        blockClass: cls,
        locations: (declaredBlockClassesMap.get(cls) || []).map((loc) => ({
            filePath: path.relative(projectPath, loc.filePath),
            blockName: loc.blockName
        }))
    }))

    // Generar reporte
    try {
        await generateAnalysisReport(
            projectPath,
            unusedCssSuffixes,
            unusedBlockClassNames,
            usedCssSuffixesMap,
            declaredBlockClassesMap
        )
    } catch (err) {
        console.error('Error generando reporte de análisis:', err)
    }

    return {
        unusedCss,
        unusedBlockClasses,
        stats: {
            jsonFiles: jsonFiles.length,
            cssFiles: cssFiles.length,
            uniqueBlockClasses: declaredBlockClasses.size,
            uniqueCssSuffixes: usedCssSuffixes.size
        }
    }
}

/**
 * Obtiene las reglas candidatas a eliminación con sus datos para la UI.
 */
export async function getCandidateRules(projectPath: string): Promise<RuleCandidate[]> {
    const jsonFiles = findJsonFiles(projectPath)
    const cssFiles = findCssFiles(projectPath)

    const declaredBlockClassesMap = await extractBlockClasses(jsonFiles)
    const usedCssSuffixesMap = await extractCssSuffixes(cssFiles)

    const declaredBlockClasses = new Set(declaredBlockClassesMap.keys())
    const usedCssSuffixes = new Set(usedCssSuffixesMap.keys())
    const unusedSuffixes = new Set(
        [...usedCssSuffixes].filter((suffix) => !declaredBlockClasses.has(suffix))
    )

    if (unusedSuffixes.size === 0) return []

    const candidates: RuleCandidate[] = []
    let idCounter = 0

    for (const filePath of cssFiles) {
        const content = await fs.readFile(filePath, 'utf-8')
        const root = postcss.parse(content)
        const rules = identifyRulesForDeletion(root, unusedSuffixes)

        for (const rule of rules) {
            candidates.push({
                id: `rule-${idCounter++}`,
                filePath,
                relativeFilePath: path.relative(projectPath, filePath),
                ruleText: rule.toString(),
                selector: rule.selectors.join(', ')
            })
        }
    }

    return candidates
}

/**
 * Aplica el fix eliminando las reglas seleccionadas por el usuario.
 */
export async function applyFix(projectPath: string, rulesToDelete: RuleCandidate[]): Promise<FixResult> {
    // Agrupar reglas por archivo
    const rulesByFile = new Map<string, RuleCandidate[]>()
    for (const rule of rulesToDelete) {
        const existing = rulesByFile.get(rule.filePath) || []
        existing.push(rule)
        rulesByFile.set(rule.filePath, existing)
    }

    let totalDeleted = 0
    const deletedEntries: { rule: string; filePath: string }[] = []

    for (const [filePath, rules] of rulesByFile.entries()) {
        const content = await fs.readFile(filePath, 'utf-8')
        const root = postcss.parse(content)

        // Recopilar los textos de las reglas a eliminar
        const ruleTexts = new Set(rules.map((r) => r.ruleText))

        root.walkRules((cssRule) => {
            if (ruleTexts.has(cssRule.toString())) {
                deletedEntries.push({ rule: cssRule.toString(), filePath })
                cssRule.remove()
                totalDeleted++
            }
        })

        // Guardar el archivo modificado
        const newContent = root.toString()
        await fs.writeFile(filePath, newContent, 'utf-8')
    }

    // Generar reporte
    let reportPath = ''
    try {
        reportPath = await generateFixReport(projectPath, deletedEntries, [])
    } catch (err) {
        console.error('Error generando reporte de fix:', err)
    }

    return { deletedCount: totalDeleted, reportPath }
}
