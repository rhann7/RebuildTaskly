export default function MemberRoutineView({ timeEntries }: any) {
    // Kita asumsikan jam kerja 08:00 sampai 18:00
    const hours = Array.from({ length: 11 }, (_, i) => i + 8);

    return (
        <div className="bg-white dark:bg-zinc-900/40 rounded-[40px] p-8 border border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {/* Loop Hari (Misal Senin saja untuk contoh) */}
                <div className="relative border-r border-border pr-4">
                    <h4 className="text-[10px] font-black uppercase text-center mb-6 text-sada-red italic">Monday</h4>
                    
                    {/* Time Grid */}
                    <div className="relative h-[600px] border-t border-border">
                        {hours.map(hour => (
                            <div key={hour} className="h-[54px] border-b border-border/30 relative">
                                <span className="absolute -left-2 -top-2 text-[8px] font-bold text-muted-foreground bg-background px-1">
                                    {hour}:00
                                </span>
                            </div>
                        ))}

                        {/* RENDER LOG SEBAGAI BLOK (Google Calendar Style) */}
                        {timeEntries.map((log: any) => {
                            const startDate = new Date(log.start_at);
                            const startHour = startDate.getHours();
                            const startMin = startDate.getMinutes();
                            const duration = log.duration_minutes;

                            // Kalkulasi posisi Top (1 jam = 54px)
                            const top = (startHour - 1) * 54 + (startMin / 60) * 54;
                            const height = (duration / 60) * 54;

                            return (
                                <div 
                                    key={log.id}
                                    className="absolute left-2 right-0 bg-sada-red/10 border-l-2 border-sada-red rounded-lg p-2 overflow-hidden group hover:z-20 hover:scale-[1.02] transition-all"
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                >
                                    <p className="text-[9px] font-black uppercase leading-tight truncate">{log.task?.title}</p>
                                    <p className="text-[8px] opacity-60 truncate">{log.note}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}