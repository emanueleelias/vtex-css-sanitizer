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
            <div className="px-8 py-6 bg-bg-secondary border-b border-border">
                <div className="flex items-center gap-8">
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
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {isClean ? (
                    <div className="fade-in text-center py-24">
                        <div className="text-6xl mb-6">🎉</div>
                        <h3 className="text-2xl font-bold text-accent-green mb-3">¡Proyecto limpio!</h3>
                        <p className="text-text-secondary text-base">
                            No se encontraron clases CSS ni blockClass sin uso.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* CSS sin blockClass */}
                        {hasUnusedCss && (
                            <section className="fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-4 h-4 rounded-full bg-accent-red shadow-[0_0_10px_rgba(233,69,96,0.4)]" />
                                    <h3 className="text-base font-semibold text-text-primary tracking-wide">
                                        Sufijos CSS sin blockClass ({data.unusedCss.length})
                                    </h3>
                                </div>
                                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                                    Estas reglas CSS usan sufijos que no corresponden a ninguna <code className="text-text-secondary">blockClass</code> declarada.
                                    Pueden ser eliminadas con el comando Fix.
                                </p>
                                <div className="space-y-4">
                                    {data.unusedCss.map((item) => (
                                        <div
                                            key={item.suffix}
                                            className="group rounded-2xl bg-bg-card border border-border hover:border-accent-red/40 transition-colors p-6 shadow-sm"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="px-2.5 py-1 rounded bg-accent-red/10 text-accent-red text-xs font-bold shrink-0 uppercase tracking-widest">CSS</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base font-mono text-text-primary font-medium mb-1">
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
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-4 h-4 rounded-full bg-accent-yellow shadow-[0_0_10px_rgba(255,208,115,0.4)]" />
                                    <h3 className="text-base font-semibold text-text-primary tracking-wide">
                                        blockClass sin CSS ({data.unusedBlockClasses.length})
                                    </h3>
                                </div>
                                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                                    Estas <code className="text-text-secondary tracking-wide">blockClass</code> están declaradas pero no tienen reglas CSS asociadas.
                                </p>
                                <div className="space-y-4">
                                    {data.unusedBlockClasses.map((item) => (
                                        <div
                                            key={item.blockClass}
                                            className="group rounded-2xl bg-bg-card border border-border hover:border-accent-yellow/40 transition-colors p-6 shadow-sm"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="px-2.5 py-1 rounded bg-accent-yellow/10 text-accent-yellow text-xs font-bold shrink-0 uppercase tracking-widest">JSON</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base font-mono text-text-primary font-medium mb-1">
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
            <div className="px-8 py-5 bg-bg-secondary border-t border-border flex items-center gap-4">
                <button
                    onClick={onGoHome}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors border border-border"
                >
                    ← Volver al inicio
                </button>
                <div className="flex-1" />
                {hasUnusedCss && (
                    <button
                        onClick={onGoToFix}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue-btn to-accent-blue-btn-hover text-white font-semibold text-base tracking-wide hover:shadow-xl hover:shadow-accent-blue-btn/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        🛠️ Proceder a Limpiar CSS
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
        <div className="text-center bg-bg-card py-4 px-6 rounded-2xl border border-border shadow-sm">
            <p className={`text-2xl font-bold font-mono mb-1 ${colorMap[color]}`}>{value}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-semibold">{label}</p>
        </div>
    )
}

export default AnalysisPage
