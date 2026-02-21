import { useState, useCallback, useEffect } from "react";
import { Clock, Layout, Paperclip, Plus } from "lucide-react";

interface TimeEntry {
  id: number;
  taskName: string;
    date: string; // Format: YYYY-MM-DD
    startTime: string; // Format: HH:mm
    endTime: string; // Format: HH:mm
    status: "draft" | "submitted" | "approved" | "revision";
}

interface TimeGridProps {
    viewMode: "daily" | "weekly";
    currentDate: Date;
    entries: TimeEntry[];
    onTimeSlotClick: (date: string, hour: number) => void;
    onEntryClick: (entry: TimeEntry) => void;
}

export function TimeGrid({
  viewMode,
  currentDate,
  entries,
  onTimeSlotClick,
  onEntryClick,
}: TimeGridProps) {
  const [now, setNow] = useState(new Date());
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Update indikator garis merah setiap menit
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = viewMode === "weekly" ? getWeekDays() : [currentDate];

  const formatHour = (hour: number) => {
    if (hour === 0) return ""; // Kosongkan 12 AM agar bersih di atas
    const h = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${h} ${ampm}`;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // Menghitung posisi garis merah (Current Time Indicator)
  const getCurrentTimeTop = () => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    return `${(minutes / (24 * 60)) * 100}%`;
  };

  const getStatusColor = (status: TimeEntry["status"]) => {
    switch (status) {
      case "draft": return "bg-zinc-100 border-zinc-300 text-zinc-700";
      case "submitted": return "bg-blue-500/10 border-blue-500/30 text-blue-700";
      case "approved": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700";
      case "revision": return "bg-sada-red/10 border-sada-red/30 text-sada-red";
      default: return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div className="bg-background border border-border rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
      
      {/* SADA STYLE BANNER */}
      <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="size-2 bg-sada-red rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Operational Timeline <span className="text-foreground/20 mx-2">|</span> 
                <span>Transmission Log Sector 7</span>
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Clock size={14} className="text-sada-red" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Sync: Nominal</span>
        </div>
      </div>

      <div className="overflow-auto  relative">
        <div className="min-w-[800px] relative">
          
          {/* Header - Days */}
          <div className="grid sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-30" 
               style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
            <div className="p-4 border-r border-border flex items-center justify-center">
                <Layout size={16} className="text-muted-foreground opacity-30" />
            </div>
            {days.map((day, index) => (
              <div key={index} className={`p-4 text-center border-r border-border ${isToday(day) ? "bg-sada-red/[0.02]" : ""}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={`text-xl tracking-tighter ${isToday(day) ? "text-sada-red font-black" : "text-foreground font-bold"}`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid Container */}
          <div className="relative">
            
            {/* CURRENT TIME INDICATOR (Garis Merah Google Calendar) */}
            <div className="absolute left-0 w-full z-20 pointer-events-none" style={{ top: getCurrentTimeTop() }}>
                <div className="flex items-center">
                    <div className="size-3 bg-sada-red rounded-full -ml-1.5 shadow-lg" />
                    <div className="h-px w-full bg-sada-red shadow-sm" />
                </div>
            </div>

            {/* Grid Lines & Labels */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-border/50 hover:bg-muted/5 transition-all group"
                style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)`, minHeight: "60px" }}
              >
                {/* Hour Label */}
                <div className="relative">
                    <span className="absolute -top-2.5 left-0 w-full text-center text-[10px] font-bold  uppercase">
                        {formatHour(hour)}
                    </span>
                    <div className="h-full border-r border-border" />
                </div>

                {/* Day Slots */}
                {days.map((day, dayIndex) => {
                  const dateStr = day.toISOString().split("T")[0];
                  const slotEntries = entries.filter(e => {
                      const [h] = e.startTime.split(":").map(Number);
                      return e.date === dateStr && h === hour;
                  });

                  return (
                    <div
                      key={dayIndex}
                      className={`relative border-r border-border/40 cursor-pointer transition-colors ${isToday(day) ? "bg-sada-red/[0.01]" : ""}`}
                      onClick={() => onTimeSlotClick(dateStr, hour)}
                    >
                      {/* Sub-grid line (30 min mark) */}
                      <div className="absolute top-1/2 w-full border-t border-border/5 border-dashed pointer-events-none" />

                      {/* Entries */}
                      {slotEntries.map((entry) => {
                          const [sH, sM] = entry.startTime.split(":").map(Number);
                          const [eH, eM] = entry.endTime.split(":").map(Number);
                          const duration = (eH * 60 + eM) - (sH * 60 + sM);
                          
                          return (
                            <div
                              key={entry.id}
                              className={`absolute left-1 right-1 rounded-xl border-l-4 p-3 cursor-pointer hover:shadow-xl hover:brightness-95 transition-all z-10 ${getStatusColor(entry.status)}`}
                              style={{
                                top: `${(sM / 60) * 100}%`,
                                height: `${(duration / 60) * 100}%`,
                                minHeight: '30px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEntryClick(entry);
                              }}
                            >
                              <div className="flex flex-col h-full overflow-hidden">
                                <span className="text-[10px] font-black uppercase truncate leading-none mb-1">
                                    {entry.taskName}
                                </span>
                                <span className="text-[8px] font-bold opacity-60">
                                    {entry.startTime} - {entry.endTime}
                                </span>
                              </div>
                            </div>
                          );
                      })}
                      
                      {/* Plus on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus size={14} className="text-sada-red/20" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}