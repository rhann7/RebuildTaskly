import { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Layout, Plus, GripHorizontal } from "lucide-react";
import dayjs from "dayjs";

interface TimeEntry {
  id: number;
  taskName: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  status: "draft" | "submitted" | "approved" | "revision";
}

interface TimeGridProps {
  viewMode: "daily" | "weekly";
  currentDate: Date;
  entries: TimeEntry[];
  onTimeSlotClick: (date: string, hour: number) => void;
  onEntryClick: (entry: TimeEntry) => void;
  onEntryUpdate: (entry: TimeEntry) => void;
}

// Konstanta UI
const ROW_HEIGHT = 80; // 80px per jam
const MINS_PER_PIXEL = 60 / ROW_HEIGHT;

export function TimeGrid({
  viewMode,
  currentDate,
  entries = [],
  onTimeSlotClick,
  onEntryClick,
  onEntryUpdate,
}: TimeGridProps) {
  const [now, setNow] = useState(new Date());
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const gridRef = useRef<HTMLDivElement>(null);

  // --- DRAG & RESIZE STATES ---
  const [draggingEntry, setDraggingEntry] = useState<TimeEntry | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
  const [startY, setStartY] = useState(0);
  const [initialEntrySnapshot, setInitialEntrySnapshot] = useState<TimeEntry | null>(null);
  const [isMoved, setIsMoved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const days = useMemo(() => {
    if (viewMode === "daily") return [currentDate];
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  }, [currentDate, viewMode]);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getStatusColor = (status: TimeEntry["status"]) => {
    switch (status) {
      case "draft": return "bg-zinc-100 border-zinc-400 text-zinc-700 shadow-md";
      case "submitted": return "bg-blue-50 border-blue-500 text-blue-700 shadow-md";
      case "approved": return "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md";
      case "revision": return "bg-red-50 border-red-500 text-red-700 shadow-md";
      default: return "bg-muted border-border text-foreground";
    }
  };

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const safeMins = Math.max(0, Math.min(1439, mins));
    const h = Math.floor(safeMins / 60);
    const m = Math.floor(safeMins % 60);
    const snappedM = Math.round(m / 15) * 15;
    let finalH = h;
    let finalM = snappedM;
    if (finalM === 60) { finalH += 1; finalM = 0; }
    return `${finalH.toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`;
  };

  // --- MOUSE EVENT HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent, entry: TimeEntry, type: 'move' | 'resize') => {
    e.stopPropagation();
    
    setDraggingEntry({ ...entry });
    setInitialEntrySnapshot({ ...entry });
    setDragType(type);
    setStartY(e.clientY);
    setIsMoved(false);
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingEntry || !initialEntrySnapshot || !dragType) return;

    const deltaY = e.clientY - startY;
    const deltaMins = Math.round(deltaY * MINS_PER_PIXEL / 15) * 15; 

    if (deltaMins !== 0) {
        setIsMoved(true);
    }

    if (deltaMins === 0) return; 

    const newEntry = { ...draggingEntry };
    const initStartMins = timeToMinutes(initialEntrySnapshot.startTime);
    const initEndMins = timeToMinutes(initialEntrySnapshot.endTime);

    if (dragType === 'move') {
        const duration = initEndMins - initStartMins;
        const newStartMins = initStartMins + deltaMins;
        
        if (newStartMins >= 0 && newStartMins + duration <= 1440) {
            newEntry.startTime = minutesToTime(newStartMins);
            newEntry.endTime = minutesToTime(newStartMins + duration);
        }
    } else if (dragType === 'resize') {
        const newEndMins = initEndMins + deltaMins;
        if (newEndMins > initStartMins + 14 && newEndMins <= 1440) {
            newEntry.endTime = minutesToTime(newEndMins);
        }
    }

    setDraggingEntry(newEntry);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    
    if (draggingEntry && initialEntrySnapshot) {
        if (isMoved) {
            onEntryUpdate(draggingEntry);
        } else {
            onEntryClick(initialEntrySnapshot);
        }
    }
    
    setDraggingEntry(null);
    setDragType(null);
    setInitialEntrySnapshot(null);
    setIsMoved(false);
    
    try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch(err) {}
  };

  const displayEntries = useMemo(() => {
    if (!draggingEntry) return entries;
    return entries.map(e => e.id === draggingEntry.id ? draggingEntry : e);
  }, [entries, draggingEntry]);

  return (
    <div className="bg-background border border-border rounded-[32px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 flex flex-col h-[800px] select-none">
      
      <div className="bg-muted/20 border-b border-border p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-2 bg-sada-red rounded-full animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            My Timesheet <span className="text-border mx-2">|</span> Operational Timeline
          </p>
        </div>
      </div>

      <div className="overflow-auto relative flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20" ref={gridRef}>
        <div className="min-w-[800px] relative">
          
          <div className="grid sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-40 shadow-sm"
            style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
            <div className="p-4 border-r border-border flex items-center justify-center bg-background">
              <Layout size={16} className="text-muted-foreground opacity-30" />
            </div>
            {days.map((day, index) => (
              <div key={index} className={`p-4 text-center border-r border-border ${isToday(day) ? "bg-sada-red/[0.03]" : "bg-background"}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest ${isToday(day) ? 'text-sada-red' : 'text-muted-foreground'}`}>
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={`text-2xl mt-1 tracking-tighter ${isToday(day) ? "text-sada-red font-black" : "text-foreground font-bold"}`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: `${24 * ROW_HEIGHT}px` }}>
            
            {/* GRID LINES & LABELS */}
            {hours.map((hour) => (
              <div key={hour} className="absolute w-full flex" style={{ top: `${hour * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}>
                <div className="w-[80px] shrink-0 border-r border-border relative">
                  <span className="absolute -top-2.5 right-4 text-[10px] font-bold text-muted-foreground">{formatHour(hour)}</span>
                </div>

                {/* Day Slots */}
                {days.map((day, dayIndex) => {
                  const dateStr = dayjs(day).format("YYYY-MM-DD");
                  const dayEntries = displayEntries.filter(e => e.date === dateStr);

                  // --- ALGORITMA OVERLAP YANG BARU (CLUSTERING & COLUMNS) ---
                  const layoutMap = new Map<number, { width: string, left: string }>();
                  
                  if (dayEntries.length > 0) {
                      // 1. Urutkan berdasarkan waktu mulai, lalu waktu selesai (durasi terpanjang)
                      const sorted = [...dayEntries].sort((a, b) => {
                          const sA = timeToMinutes(a.startTime);
                          const sB = timeToMinutes(b.startTime);
                          return sA !== sB ? sA - sB : timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
                      });

                      // 2. Kelompokkan jadwal yang bersinggungan ke dalam "cluster"
                      const clusters: TimeEntry[][] = [];
                      let currentCluster: TimeEntry[] = [];
                      let clusterEnd = 0;

                      sorted.forEach(entry => {
                          const start = timeToMinutes(entry.startTime);
                          const end = timeToMinutes(entry.endTime);
                          
                          if (currentCluster.length > 0 && start >= clusterEnd) {
                              clusters.push(currentCluster);
                              currentCluster = [];
                              clusterEnd = 0;
                          }
                          currentCluster.push(entry);
                          clusterEnd = Math.max(clusterEnd, end);
                      });
                      if (currentCluster.length > 0) clusters.push(currentCluster);

                      // 3. Bagi ke dalam kolom-kolom agar tidak bertabrakan
                      clusters.forEach(cluster => {
                          const columns: TimeEntry[][] = [];
                          
                          cluster.forEach(entry => {
                              const start = timeToMinutes(entry.startTime);
                              let placed = false;
                              
                              for (let i = 0; i < columns.length; i++) {
                                  const lastEvent = columns[i][columns[i].length - 1];
                                  if (start >= timeToMinutes(lastEvent.endTime)) {
                                      columns[i].push(entry);
                                      placed = true;
                                      break;
                                  }
                              }
                              if (!placed) columns.push([entry]);
                          });

                          // 4. Hitung persentase ukuran (width) dan posisi (left)
                          const numCols = columns.length;
                          columns.forEach((col, colIndex) => {
                              col.forEach(entry => {
                                  layoutMap.set(entry.id, {
                                      width: `calc(${100 / numCols}% - 4px)`,
                                      left: `calc(${(100 / numCols) * colIndex}% + 2px)`
                                  });
                              });
                          });
                      });
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`flex-1 relative border-r border-b border-border/40 transition-colors ${isToday(day) ? "bg-sada-red/[0.01]" : ""}`}
                      onPointerDown={(e) => {
                         // CEGAH BUBBLING
                         if (e.target === e.currentTarget) {
                             onTimeSlotClick(dateStr, hour);
                         }
                      }}
                    >
                      <div className="absolute top-1/2 w-full border-t border-border/20 border-dashed pointer-events-none" />

                      {/* RENDER TASKS */}
                      {hour === 0 && dayEntries.map((entry) => {
                        const startMins = timeToMinutes(entry.startTime);
                        const endMins = timeToMinutes(entry.endTime);
                        const duration = endMins - startMins;

                        // Ambil layout yang sudah dihitung oleh algoritma overlap di atas
                        const layout = layoutMap.get(entry.id) || { width: 'calc(100% - 4px)', left: '2px' };
                        const isDraggingThis = draggingEntry?.id === entry.id;

                        return (
                          <div
                            key={entry.id}
                            className={`absolute rounded-xl border-l-4 p-2 transition-all overflow-hidden flex flex-col group/card
                                ${getStatusColor(entry.status)} border border-y-black/5 border-r-black/5
                                ${isDraggingThis ? 'z-50 opacity-80 ring-2 ring-sada-red shadow-2xl scale-[1.02] cursor-grabbing' : 'z-20 hover:shadow-lg hover:z-30 cursor-grab'}
                            `}
                            style={{
                              top: `${(startMins / 60) * ROW_HEIGHT + 2}px`,
                              height: `${(duration / 60) * ROW_HEIGHT - 4}px`,
                              minHeight: '28px',
                              width: layout.width,
                              left: layout.left,
                            }}
                            onPointerDown={(e) => handlePointerDown(e, entry, 'move')}
                          >
                            <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-30 pointer-events-none">
                                <GripHorizontal size={12} />
                            </div>

                            <span className="text-[10px] font-black uppercase truncate leading-tight pointer-events-none">
                              {entry.taskName}
                            </span>
                            {duration > 30 && (
                              <span className="text-[9px] font-bold opacity-70 mt-0.5 truncate pointer-events-none">
                                {entry.startTime} - {entry.endTime}
                              </span>
                            )}

                            <div 
                                className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize flex items-end justify-center group-hover/card:bg-black/5"
                                onPointerDown={(e) => handlePointerDown(e, entry, 'resize')}
                            >
                                <div className="w-6 h-1 bg-black/20 rounded-full mb-1" />
                            </div>
                          </div>
                        );
                      })}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus size={20} className="text-muted-foreground/30" />
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