import { router, Link } from '@inertiajs/react';
import { 
    Check, 
    Loader2, 
    Clock, 
    Calendar, 
    MoreVertical, 
    Trash2, 
    Info, 
    Edit3 
} from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const SubTaskItem = ({ sub, workspace, project, task }: any) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = () => {
        if (isUpdating) return;
        setIsUpdating(true);
        const url = `/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}/toggle`;

        router.patch(url, {}, {
            preserveScroll: true,
            onFinish: () => setIsUpdating(false),
        });
    };

    return (
        <div className="group relative bg-white dark:bg-zinc-900/40 border border-border rounded-[24px] p-5 flex items-center justify-between hover:border-sada-red/40 hover:shadow-2xl hover:shadow-sada-red/5 transition-all duration-300 overflow-hidden">
            
            <div className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 ${sub.is_completed ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-sada-red/20'}`} />

            <div className="flex items-center gap-6 pl-2">
                {/* CHECKBOX SQUARE STYLE */}
                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`relative size-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 active:scale-90
                        ${sub.is_completed 
                            ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/20' 
                            : 'border-zinc-300 dark:border-white/20 bg-transparent hover:border-sada-red/50'}
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isUpdating ? (
                        <Loader2 size={14} className="text-zinc-400 animate-spin" />
                    ) : sub.is_completed ? (
                        <Check size={16} strokeWidth={4} className="text-white animate-in zoom-in duration-300" />
                    ) : null}
                </button>

                <div className="flex flex-col gap-1">
                    <span className={`text-[15px] font-black uppercase tracking-tight transition-all duration-500 
                        ${sub.is_completed ? 'text-zinc-400 line-through italic opacity-50' : 'text-zinc-900 dark:text-white'}`}>
                        {sub.title}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* DROPDOWN MENU TIGA TITIK */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                            <MoreVertical size={18} className="text-zinc-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-border">
                        
                        {/* Option: View Details (Trigger Sheet) */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-muted rounded-lg transition-all">
                                    <Info size={14} /> Details
                                </button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] border-l-border bg-white dark:bg-zinc-950 p-10">
                                <SheetHeader className="mb-10">
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter">{sub.title}</SheetTitle>
                                    <div className="h-1 w-20 bg-sada-red" />
                                </SheetHeader>
                                {/* ... Content Sheet Tetap Sama ... */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex gap-6 relative">
                                        <div className="absolute left-[15px] top-10 bottom-[-30px] w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                                        <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-border z-10">
                                            <Calendar size={14} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-sada-red uppercase tracking-widest mb-1">Details</h4>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sub.title}</p>
                                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                                                <Clock size={10} /> {new Date(sub.created_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest cursor-pointer rounded-lg">
                            <Edit3 size={14} /> Update
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer rounded-lg"
                            onClick={() => {
                                if(confirm('Terminate this objective permanently?')) {
                                    router.delete(`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}`, {
                                        preserveScroll: true
                                    });
                                }
                            }}
                        >
                            <Trash2 size={14} /> Terminate
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};