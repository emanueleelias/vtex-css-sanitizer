import { useState, useCallback } from 'react'
import { Paintbrush, FolderOpen, Search } from 'lucide-react'

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
        <div className="h-full flex items-center justify-center p-12">
            <div className="fade-in max-w-xl w-full text-center">
                {/* Logo grande */}
                <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-pink via-accent-blue to-accent-green flex items-center justify-center mb-8 pulse-glow shadow-lg shadow-accent-pink/10">
                    <Paintbrush size={48} className="text-white" />
                </div>

                <h2 className="text-3xl font-bold text-text-primary mb-4 tracking-tight">VTEX CSS Sanitizer</h2>
                <p className="text-text-secondary text-base mb-10 leading-relaxed max-w-md mx-auto">
                    Analiza y limpia clases CSS y blockClass no utilizados en tu proyecto VTEX IO.
                    <br className="mb-2" />
                    Selecciona la carpeta raíz de tu proyecto para comenzar.
                </p>

                {/* Selector de carpeta */}
                <div className="space-y-6">
                    <button
                        onClick={handleSelectFolder}
                        className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-border hover:border-accent-blue transition-all duration-300 p-8 cursor-pointer bg-bg-secondary hover:bg-bg-card"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-bg-card group-hover:bg-accent-blue/10 flex items-center justify-center transition-colors duration-300">
                                <FolderOpen className="w-7 h-7 text-text-muted group-hover:text-accent-blue transition-colors" strokeWidth={1.5} />
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
                            className="fade-in w-full py-4 px-8 rounded-xl bg-gradient-to-r from-accent-blue-btn to-accent-blue-btn-hover text-white font-semibold text-base tracking-wide hover:shadow-xl hover:shadow-accent-blue-btn/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Search size={18} />
                            Analizar Proyecto
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
