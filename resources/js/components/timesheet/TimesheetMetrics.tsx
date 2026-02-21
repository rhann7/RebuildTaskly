import { Clock, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

interface TimesheetStatsProps {
  totalHoursWeek: number;
  approvedHours: number;
  pendingHours: number;
  draftHours: number;
}

export function TimesheetMetrics({
  totalHoursWeek,
  approvedHours,
  pendingHours,
  draftHours,
}: TimesheetStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* TOTAL HOURS - PRIMARY CARD */}
      <div className="bg-background border border-border rounded-[32px] p-6 shadow-sm group hover:border-sada-red/30 transition-all duration-500 relative overflow-hidden">
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ">
              Accumulated / Week
            </span>
            <div className="p-2 bg-sada-red/10 rounded-xl text-sada-red group-hover:scale-110 transition-transform">
              <Clock size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-black   text-foreground leading-none">
              {totalHoursWeek.toFixed(1)}
              <small className="text-[10px] not- ml-2 opacity-40 uppercase font-bold">Hrs</small>
            </h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Total System Engagement</p>
          </div>
        </div>
      </div>

      {/* APPROVED HOURS */}
      <div className="bg-background border border-border rounded-[32px] p-6 shadow-sm group hover:border-emerald-500/30 transition-all duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ">
              Verified Status
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-black   text-emerald-500 leading-none">
              {approvedHours.toFixed(1)}
              <small className="text-[10px] not- ml-2 opacity-40 uppercase font-bold text-muted-foreground">Hrs</small>
            </h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Authorized Records</p>
          </div>
        </div>
      </div>

      {/* PENDING HOURS */}
      <div className="bg-background border border-border rounded-[32px] p-6 shadow-sm group hover:border-amber-500/30 transition-all duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ">
              Pending Review
            </span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-black   text-amber-500 leading-none">
              {pendingHours.toFixed(1)}
              <small className="text-[10px] not- ml-2 opacity-40 uppercase font-bold text-muted-foreground">Hrs</small>
            </h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Awaiting Verification</p>
          </div>
        </div>
      </div>

      {/* DRAFT HOURS */}
      <div className="bg-background border border-border rounded-[32px] p-6 shadow-sm group hover:border-sada-red/30 transition-all duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ">
              Draft Logs
            </span>
            <div className="p-2 bg-muted rounded-xl text-muted-foreground">
              <AlertCircle size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-black   text-foreground leading-none">
              {draftHours.toFixed(1)}
              <small className="text-[10px] not- ml-2 opacity-40 uppercase font-bold text-muted-foreground">Hrs</small>
            </h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Unsubmitted Entries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
