/** Shared types between main and renderer via IPC */

export interface UnusedCssEntry {
    suffix: string
    locations: { filePath: string; selector: string }[]
}

export interface UnusedBlockClassEntry {
    blockClass: string
    locations: { filePath: string; blockName: string }[]
}

export interface AnalysisResult {
    unusedCss: UnusedCssEntry[]
    unusedBlockClasses: UnusedBlockClassEntry[]
    stats: {
        jsonFiles: number
        cssFiles: number
        uniqueBlockClasses: number
        uniqueCssSuffixes: number
    }
}

export interface RuleCandidate {
    filePath: string
    relativeFilePath: string
    ruleText: string
    selector: string
    id: string
}

export interface FixRequest {
    projectPath: string
    rulesToDelete: RuleCandidate[]
}

export interface FixResult {
    deletedCount: number
    reportPath: string
}
