import { useState, useEffect, useCallback } from 'react'

interface RuleCandidate {
    id: string
    filePath: string
    relativeFilePath: string
    ruleText: string
    selector: string
}

interface FixPageProps {
    projectPath: string
    onBack: () => void
    onGoHome: () => void
}

type FixStatus = 'loading' | 'ready' | 'applying' | 'done' | 'error'

function FixPage({ projectPath, onBack, onGoHome }: FixPageProps): JSX.Element {
    const [candidates, setCandidates] = useState<RuleCandidate[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [status, setStatus] = useState<FixStatus>('loading')
    const [deletedCount, setDeletedCount] = useState(0)
    const [reportPath, setReportPath] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // Cargar candidatos
    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const result = await window.api.getCandidates(projectPath)
                setCandidates(result)
                // Seleccionar todas por defecto
                setSelectedIds(new Set(result.map((r: RuleCandidate) => r.id)))
                setStatus('ready')
            } catch (err) {
                setStatus('error')
                setErrorMsg(err instanceof Error ? err.message : 'Error cargando candidatos')
            }
        }
        load()
    }, [projectPath])

    const toggleRule = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(candidates.map((r) => r.id)))
    }, [candidates])

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const handleApplyFix = useCallback(async () => {
        const rulesToDelete = candidates.filter((r) => selectedIds.has(r.id))
        if (rulesToDelete.length === 0) return

        setStatus('applying')
        try {
            const result = await window.api.applyFix(projectPath, rulesToDelete)
            setDeletedCount(result.deletedCount)
            setReportPath(result.reportPath)
            setStatus('done')
        } catch (err) {
            setStatus('error')
            setErrorMsg(err instanceof Error ? err.message : 'Error aplicando cambios')
        }
    }, [candidates, selectedIds, projectPath])

    const handleOpenReport = useCallback(() => {
        if (reportPath) window.api.openReport(reportPath)
    }, [reportPath])

    // Agrupar por archivo
    const groupedByFile = candidates.reduce(
        (acc, rule) => {
            const key = rule.relativeFilePath
            if (!acc[key]) acc[key] = []
            acc[key].push(rule)
            return acc
        },
        {} as Record<string, RuleCandidate[]>
    )

    if (status === 'loading') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="fade-in flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
                    <span className="text-sm text-text-secondary">Buscando reglas candidatas...</span>
                </div>
            </div>
        )
    }

    if (status === 'done') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="fade-in text-center max-w-md">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-accent-green mb-2">¡Limpieza completada!</h3>
                    <p className="text-text-secondary text-sm mb-6">
                        Se eliminaron <span className="text-accent-blue font-bold font-mono">{deletedCount}</span> reglas
                        CSS de tu proyecto.
                    </p>

                    <div className="space-y-3">
                        {reportPath && (
                            <button
                                onClick={handleOpenReport}
                                className="w-full px-6 py-2.5 rounded-xl border border-border hover:border-accent-blue bg-bg-card hover:bg-bg-card-hover text-sm text-text-primary transition-all"
                            >
                                📄 Ver reporte en explorador
                            </button>
                        )}
                        <button
                            onClick={onGoHome}
                            className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue-btn to-accent-blue-btn-hover text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent-blue-btn/25 transition-all duration-300"
                        >
                            🏠 Analizar otro proyecto
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="fade-in text-center max-w-md">
                    <div className="text-5xl mb-4">❌</div>
                    <h3 className="text-lg font-bold text-accent-red mb-2">Error</h3>
                    <p className="text-text-secondary text-sm mb-4">{errorMsg}</p>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-lg text-sm text-accent-blue hover:underline"
                    >
                        ← Volver al análisis
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="px-8 py-5 bg-bg-secondary border-b border-border flex items-center gap-5">
                <h3 className="text-base font-semibold text-text-primary tracking-wide">
                    Reglas candidatas a eliminar
                </h3>
                <span className="text-sm text-text-muted font-mono bg-bg-card px-3 py-1 rounded-md border border-border">
                    {selectedIds.size} de {candidates.length} seleccionadas
                </span>
                <div className="ml-auto flex items-center gap-3">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 rounded-lg text-sm text-accent-blue hover:bg-bg-card transition-colors border border-border font-medium"
                    >
                        Seleccionar todas
                    </button>
                    <button
                        onClick={deselectAll}
                        className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-card transition-colors border border-border font-medium"
                    >
                        Deseleccionar todas
                    </button>
                </div>
            </div>

            {/* Rules list */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {candidates.length === 0 ? (
                    <div className="fade-in text-center py-16">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-accent-green mb-2">¡Sin candidatos!</h3>
                        <p className="text-text-secondary text-sm">
                            No hay reglas CSS para eliminar.
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedByFile).map(([file, rules]) => (
                        <div key={file} className="fade-in">
                            <div className="flex items-center gap-3 mb-3">
                                <svg className="w-5 h-5 text-text-muted/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-mono text-text-secondary font-medium">{file}</span>
                                <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded-full border border-border/50">
                                    {rules.length} regla{rules.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className={`rounded-2xl border transition-all duration-200 ${selectedIds.has(rule.id)
                                            ? 'bg-accent-red/5 border-accent-red/30'
                                            : 'bg-bg-input border-border hover:border-border-active/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4 p-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(rule.id)}
                                                onChange={() => toggleRule(rule.id)}
                                                className="mt-1 w-5 h-5 rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-mono text-text-primary truncate">{rule.selector}</p>
                                                <button
                                                    onClick={() => toggleExpand(rule.id)}
                                                    className="text-xs text-accent-blue hover:underline mb-1 mt-2 inline-block font-medium"
                                                >
                                                    {expandedIds.has(rule.id) ? 'Ocultar código ▲' : 'Ver código ▼'}
                                                </button>
                                                {expandedIds.has(rule.id) && (
                                                    <div className="code-block mt-2 text-text-secondary">
                                                        {rule.ruleText}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedIds.has(rule.id) && (
                                                <span className="text-xs px-2 py-1 rounded bg-accent-red/10 text-accent-red font-bold shrink-0 mt-0.5 uppercase tracking-wider">
                                                    SE ELIMINARÁ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Action bar */}
            <div className="px-8 py-5 bg-bg-secondary border-t border-border flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors border border-border"
                >
                    ← Volver atrás
                </button>
                <div className="flex-1" />
                {status === 'applying' ? (
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
                        <span className="text-base text-text-secondary font-medium">Aplicando cambios...</span>
                    </div>
                ) : (
                    <button
                        onClick={handleApplyFix}
                        disabled={selectedIds.size === 0}
                        className={`px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${selectedIds.size > 0
                            ? 'bg-gradient-to-r from-accent-blue-btn to-accent-blue-btn-hover text-white hover:shadow-xl hover:shadow-accent-blue-btn/20 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-bg-card border border-border text-text-muted cursor-not-allowed'
                            }`}
                    >
                        🗑️ Eliminar {selectedIds.size} regla{selectedIds.size !== 1 ? 's' : ''}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FixPage
