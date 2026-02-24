import { useState, useCallback } from 'react'

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

interface HomePageProps {
    onAnalysisComplete: (data: AnalysisData, path: string) => void
}

type Status = 'idle' | 'selected' | 'analyzing' | 'error'

function HomePage({ onAnalysisComplete }: HomePageProps): JSX.Element {
    const [selectedPath, setSelectedPath] = useState<string>('')
    const [status, setStatus] = useState<Status>('idle')
    const [errorMsg, setErrorMsg] = useState<string>('')

    const handleSelectFolder = useCallback(async () => {
        const path = await window.api.selectFolder()
        if (path) {
            setSelectedPath(path)
            setStatus('selected')
            setErrorMsg('')
        }
    }, [])

    const handleAnalyze = useCallback(async () => {
        if (!selectedPath) return
        setStatus('analyzing')
        setErrorMsg('')

        try {
            const result = await window.api.runAnalysis(selectedPath)
            onAnalysisComplete(result, selectedPath)
        } catch (err) {
            setStatus('error')
            setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al analizar el proyecto')
        }
    }, [selectedPath, onAnalysisComplete])

    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="fade-in max-w-lg w-full text-center">
                {/* Logo grande */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink via-accent-blue to-accent-green flex items-center justify-center mb-6 pulse-glow">
                    <span className="text-white text-3xl font-bold">V</span>
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-2">VTEX CSS Sanitizer</h2>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                    Analiza y limpia clases CSS y blockClass no utilizados en tu proyecto VTEX IO.
                    <br />
                    Selecciona la carpeta raíz de tu proyecto para comenzar.
                </p>

                {/* Selector de carpeta */}
                <div className="space-y-4">
                    <button
                        onClick={handleSelectFolder}
                        className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-accent-blue transition-all duration-300 p-6 cursor-pointer bg-bg-secondary hover:bg-bg-card"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-bg-card group-hover:bg-accent-blue/10 flex items-center justify-center transition-colors duration-300">
                                <svg className="w-6 h-6 text-text-muted group-hover:text-accent-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                </svg>
                            </div>

                            {selectedPath ? (
                                <>
                                    <span className="text-sm text-accent-blue font-medium">Carpeta seleccionada</span>
                                    <span className="text-xs text-text-secondary font-mono bg-bg-input px-3 py-1.5 rounded-lg max-w-full truncate block">
                                        {selectedPath}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                        Seleccionar carpeta del proyecto
                                    </span>
                                    <span className="text-xs text-text-muted">Click para abrir el explorador de archivos</span>
                                </>
                            )}
                        </div>
                    </button>

                    {/* Botón Analizar */}
                    {status === 'selected' && (
                        <button
                            onClick={handleAnalyze}
                            className="fade-in w-full py-3 px-6 rounded-xl bg-gradient-to-r from-accent-pink to-accent-pink-hover text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent-pink/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            🔍 Analizar Proyecto
                        </button>
                    )}

                    {/* Loading */}
                    {status === 'analyzing' && (
                        <div className="fade-in flex items-center justify-center gap-3 py-4">
                            <div className="w-5 h-5 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
                            <span className="text-sm text-text-secondary">Analizando proyecto...</span>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="fade-in p-4 rounded-xl bg-accent-red/10 border border-accent-red/30">
                            <p className="text-accent-red text-sm font-medium mb-1">Error en el análisis</p>
                            <p className="text-text-secondary text-xs">{errorMsg}</p>
                            <button
                                onClick={handleAnalyze}
                                className="mt-3 text-xs text-accent-blue hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <p className="mt-8 text-xs text-text-muted">
                    Asegurate de que la carpeta contenga las carpetas <code className="text-text-secondary">/store</code> y <code className="text-text-secondary">/styles</code>
                </p>
            </div>
        </div>
    )
}

export default HomePage
