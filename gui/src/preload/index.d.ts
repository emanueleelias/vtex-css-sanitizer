import { ElectronAPI } from '@electron-toolkit/preload'

interface SanitizerAPI {
    selectFolder: () => Promise<string | null>
    runAnalysis: (projectPath: string) => Promise<import('../main/core/types').AnalysisResult>
    getCandidates: (projectPath: string) => Promise<import('../main/core/types').RuleCandidate[]>
    applyFix: (
        projectPath: string,
        rulesToDelete: import('../main/core/types').RuleCandidate[]
    ) => Promise<import('../main/core/types').FixResult>
    openReport: (reportPath: string) => Promise<void>
}

declare global {
    interface Window {
        electron: ElectronAPI
        api: SanitizerAPI
    }
}
