interface AnalysisData {
    unusedCss: { suffix: string; locations: { filePath: string; selector: string }[] }[]
    unusedBlockClasses: {
        blockClass: string
        locations: { filePath: string; blockName: string }[]
    }[]
    stats: {
        jsonFiles: number
        cssFiles: number
        uniqueBlockClasses: number
        uniqueCssSuffixes: number
    }
}

interface AnalysisPageProps {
    data: AnalysisData
    projectPath: string
    onGoToFix: () => void
    onGoHome: () => void
}

function AnalysisPage({ data, onGoToFix, onGoHome }: AnalysisPageProps): JSX.Element {
    const hasUnusedCss = data.unusedCss.length > 0
    const hasUnusedBlockClasses = data.unusedBlockClasses.length > 0
    const isClean = !hasUnusedCss && !hasUnusedBlockClasses
    const totalIssues = data.unusedCss.length + data.unusedBlockClasses.length

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Stats bar */}
            <div className="px-6 py-4 bg-bg-secondary border-b border-border">
                <div className="flex items-center gap-6">
                    <StatCard label="Archivos JSON" value={data.stats.jsonFiles} color="blue" />
                    <StatCard label="Archivos CSS" value={data.stats.cssFiles} color="blue" />
                    <StatCard label="blockClass únicas" value={data.stats.uniqueBlockClasses} color="green" />
                    <StatCard label="Sufijos CSS" value={data.stats.uniqueCssSuffixes} color="green" />
                    <div className="ml-auto flex items-center gap-2">
                        <StatCard
                            label="Problemas"
                            value={totalIssues}
                            color={isClean ? 'green' : 'red'}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isClean ? (
                    <div className="fade-in text-center py-16">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-accent-green mb-2">¡Proyecto limpio!</h3>
                        <p className="text-text-secondary text-sm">
                            No se encontraron clases CSS ni blockClass sin uso.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* CSS sin blockClass */}
                        {hasUnusedCss && (
                            <section className="fade-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-3 h-3 rounded-full bg-accent-red" />
                                    <h3 className="text-sm font-semibold text-text-primary">
                                        Sufijos CSS sin blockClass ({data.unusedCss.length})
                                    </h3>
                                </div>
                                <p className="text-xs text-text-muted mb-4">
                                    Estas reglas CSS usan sufijos que no corresponden a ninguna <code className="text-text-secondary">blockClass</code> declarada.
                                    Pueden ser eliminadas con el comando Fix.
                                </p>
                                <div className="space-y-2">
                                    {data.unusedCss.map((item) => (
                                        <div
                                            key={item.suffix}
                                            className="group rounded-xl bg-bg-card border border-border hover:border-accent-red/40 transition-colors p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-accent-red text-xs font-bold mt-0.5 shrink-0">CSS</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-mono text-text-primary font-medium">
                                                        --{item.suffix}
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        {item.locations.slice(0, 3).map((loc, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                                                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="truncate">{loc.filePath}</span>
                                                                <span className="text-text-muted/60 font-mono text-[10px]">{loc.selector}</span>
                                                            </div>
                                                        ))}
                                                        {item.locations.length > 3 && (
                                                            <span className="text-[10px] text-text-muted">
                                                                +{item.locations.length - 3} ubicaciones más
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* blockClass sin CSS */}
                        {hasUnusedBlockClasses && (
                            <section className="fade-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-3 h-3 rounded-full bg-accent-yellow" />
                                    <h3 className="text-sm font-semibold text-text-primary">
                                        blockClass sin CSS ({data.unusedBlockClasses.length})
                                    </h3>
                                </div>
                                <p className="text-xs text-text-muted mb-4">
                                    Estas <code className="text-text-secondary">blockClass</code> están declaradas pero no tienen reglas CSS asociadas.
                                </p>
                                <div className="space-y-2">
                                    {data.unusedBlockClasses.map((item) => (
                                        <div
                                            key={item.blockClass}
                                            className="group rounded-xl bg-bg-card border border-border hover:border-accent-yellow/40 transition-colors p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-accent-yellow text-xs font-bold mt-0.5 shrink-0">JSON</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-mono text-text-primary font-medium">
                                                        &quot;{item.blockClass}&quot;
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        {item.locations.slice(0, 3).map((loc, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                                                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="truncate">{loc.filePath}</span>
                                                                <span className="text-text-muted/60 text-[10px]">bloque: {loc.blockName}</span>
                                                            </div>
                                                        ))}
                                                        {item.locations.length > 3 && (
                                                            <span className="text-[10px] text-text-muted">
                                                                +{item.locations.length - 3} ubicaciones más
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Action bar */}
            <div className="px-6 py-4 bg-bg-secondary border-t border-border flex items-center gap-3">
                <button
                    onClick={onGoHome}
                    className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors border border-border"
                >
                    ← Inicio
                </button>
                <div className="flex-1" />
                {hasUnusedCss && (
                    <button
                        onClick={onGoToFix}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-pink to-accent-pink-hover text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent-pink/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        🛠️ Limpiar CSS
                    </button>
                )}
            </div>
        </div>
    )
}

function StatCard({
    label,
    value,
    color
}: {
    label: string
    value: number
    color: 'blue' | 'green' | 'red'
}): JSX.Element {
    const colorMap = {
        blue: 'text-accent-blue',
        green: 'text-accent-green',
        red: 'text-accent-red'
    }

    return (
        <div className="text-center">
            <p className={`text-lg font-bold font-mono ${colorMap[color]}`}>{value}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
        </div>
    )
}

export default AnalysisPage
