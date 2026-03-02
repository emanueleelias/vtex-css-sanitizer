import { useState, useCallback } from 'react'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import FixPage from './pages/FixPage'
import { Paintbrush } from 'lucide-react'

type Page = 'home' | 'analysis' | 'fix'

interface AnalysisData {
    unusedCss: { suffix: string; locations: { filePath: string; selector: string }[] }[]
    unusedBlockClasses: { blockClass: string; locations: { filePath: string; blockName: string }[] }[]
    stats: {
        jsonFiles: number
        cssFiles: number
        uniqueBlockClasses: number
        uniqueCssSuffixes: number
    }
}

function App(): JSX.Element {
    const [currentPage, setCurrentPage] = useState<Page>('home')
    const [projectPath, setProjectPath] = useState<string>('')
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

    const handleAnalysisComplete = useCallback((data: AnalysisData, path: string) => {
        setAnalysisData(data)
        setProjectPath(path)
        setCurrentPage('analysis')
    }, [])

    const handleGoToFix = useCallback(() => {
        setCurrentPage('fix')
    }, [])

    const handleGoHome = useCallback(() => {
        setCurrentPage('home')
        setProjectPath('')
        setAnalysisData(null)
    }, [])

    const handleBackToAnalysis = useCallback(() => {
        setCurrentPage('analysis')
    }, [])

    return (
        <div className="h-full flex flex-col bg-bg-primary">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-4 bg-bg-secondary border-b border-border drag-region">
                <div className="flex items-center gap-3 no-drag">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center shadow-md">
                        <Paintbrush size={18} className="text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-text-primary tracking-wide">VTEX CSS Sanitizer</h1>
                </div>
                {projectPath && (
                    <span className="ml-auto text-xs text-text-muted font-mono truncate max-w-[400px] no-drag">
                        {projectPath}
                    </span>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 overflow-hidden">
                {currentPage === 'home' && <HomePage onAnalysisComplete={handleAnalysisComplete} />}
                {currentPage === 'analysis' && analysisData && (
                    <AnalysisPage
                        data={analysisData}
                        projectPath={projectPath}
                        onGoToFix={handleGoToFix}
                        onGoHome={handleGoHome}
                    />
                )}
                {currentPage === 'fix' && (
                    <FixPage
                        projectPath={projectPath}
                        onBack={handleBackToAnalysis}
                        onGoHome={handleGoHome}
                    />
                )}
            </main>
        </div>
    )
}

export default App
