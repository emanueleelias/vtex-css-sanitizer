import fs from 'fs/promises'
import postcss, { Rule } from 'postcss'

export interface CssSuffixLocation {
    filePath: string
    selector: string
}

const VTEX_CLASS_REGEX = /\.[\w-]+(?:--[\w-]+)+/g

function getPrimarySuffix(vtexClassName: string): string | null {
    const parts = vtexClassName.split('--')
    if (parts.length > 1) {
        return parts[1]
    }
    return null
}

export async function extractCssSuffixes(
    cssFiles: string[]
): Promise<Map<string, CssSuffixLocation[]>> {
    const usedSuffixes = new Map<string, CssSuffixLocation[]>()

    for (const filePath of cssFiles) {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            const root = postcss.parse(content)

            root.walkRules((rule) => {
                rule.selectors.forEach((selector) => {
                    const matches = [...selector.matchAll(VTEX_CLASS_REGEX)]
                    for (const match of matches) {
                        const fullClassName = match[0].substring(1)
                        const primarySuffix = getPrimarySuffix(fullClassName)

                        if (primarySuffix) {
                            const locations = usedSuffixes.get(primarySuffix) || []
                            locations.push({ filePath, selector })
                            usedSuffixes.set(primarySuffix, locations)
                        }
                    }
                })
            })
        } catch (error) {
            console.error(`Error procesando el archivo CSS ${filePath}:`, error)
        }
    }

    return usedSuffixes
}

/**
 * Identifica todas las reglas de CSS que son candidatas a ser eliminadas.
 */
export function identifyRulesForDeletion(root: postcss.Root, unusedSuffixes: Set<string>): Rule[] {
    const candidates: Rule[] = []
    root.walkRules((rule) => {
        const ruleSelectors = rule.selectors
        let allSelectorsAreUnused = ruleSelectors.length > 0

        for (const selector of ruleSelectors) {
            const matches = [...selector.matchAll(VTEX_CLASS_REGEX)]
            if (matches.length === 0) {
                allSelectorsAreUnused = false
                break
            }
            const hasAtLeastOneUsedSuffix = matches.some((match) => {
                const primarySuffix = getPrimarySuffix(match[0].substring(1))
                return primarySuffix && !unusedSuffixes.has(primarySuffix)
            })
            if (hasAtLeastOneUsedSuffix) {
                allSelectorsAreUnused = false
                break
            }
        }

        if (allSelectorsAreUnused) {
            candidates.push(rule)
        }
    })
    return candidates
}
