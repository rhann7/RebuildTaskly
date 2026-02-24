import { router } from '@inertiajs/react';
import { 
    Check, 
    Loader2, 
    Clock, 
    Calendar, 
    MoreVertical, 
    Trash2, 
    Info, 
    Edit3,
    UserCircle2,
    X,
    Save
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export const SubTaskItem = ({ sub, workspace, project, task }: any) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    // States untuk fitur Edit Title
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(sub.title);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus saat masuk mode edit
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleToggle = () => {
        if (isUpdating || isEditing) return;
        setIsUpdating(true);
        const url = `/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}/toggle`;

        router.patch(url, {}, {
            preserveScroll: true,
            onFinish: () => setIsUpdating(false),
        });
    };

    const submitUpdate = () => {
        if (editTitle.trim() === '' || editTitle === sub.title) {
            setIsEditing(false); // Batal kalau kosong / gak berubah
            setEditTitle(sub.title);
            return;
        }

        setIsUpdating(true);
        router.patch(`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}`, 
        { title: editTitle }, 
        {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
            onFinish: () => setIsUpdating(false)
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') submitUpdate();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditTitle(sub.title);
        }
    };

    return (
        <div className="group relative bg-card border border-border rounded-[24px] p-5 flex items-center justify-between hover:border-sada-red/40 hover:shadow-lg hover:shadow-sada-red/5 transition-all duration-300 overflow-hidden">
            
            <div className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 ${sub.is_completed ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-sada-red/20'}`} />

            <div className="flex items-center gap-5 pl-2 flex-1 mr-4">
                {/* CHECKBOX SQUARE STYLE */}
                <button
                    onClick={handleToggle}
                    disabled={isUpdating || isEditing}
                    className={`relative size-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0
                        ${!isEditing && 'active:scale-90'}
                        ${sub.is_completed 
                            ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/20' 
                            : 'border-border bg-background hover:border-sada-red/50'}
                        ${(isUpdating || isEditing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isUpdating ? (
                        <Loader2 size={14} className="text-muted-foreground animate-spin" />
                    ) : sub.is_completed ? (
                        <Check size={16} strokeWidth={4} className="text-white animate-in zoom-in duration-300" />
                    ) : null}
                </button>

                {/* AREA TITLE (BISA JADI INPUT KALAU isEditing = TRUE) */}
                <div className="flex flex-col gap-1 w-full flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                            <Input 
                                ref={inputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-9 text-[13px] font-bold bg-muted/50 border-sada-red/50 focus-visible:ring-sada-red flex-1"
                            />
                            <button onClick={submitUpdate} className="p-2 bg-sada-red text-white rounded-lg hover:bg-red-600 transition-colors shrink-0">
                                <Save size={14} />
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditTitle(sub.title); }} className="p-2 bg-muted text-muted-foreground hover:bg-border rounded-lg transition-colors shrink-0">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <span className={`text-[13px] md:text-[14px] font-black uppercase tracking-tight transition-all duration-500 
                            ${sub.is_completed ? 'text-muted-foreground line-through italic opacity-60' : 'text-foreground'}`}>
                            {sub.title}
                        </span>
                    )}
                    
                    {/* INFO SIAPA YANG MENCENTANG */}
                    {sub.is_completed && sub.completer && !isEditing && (
                        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                            <UserCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Completed by <span className="text-emerald-500">{sub.completer.name}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* DROPDOWN MENU TIGA TITIK */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button disabled={isEditing} className="size-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <MoreVertical size={16} className="text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-border bg-card">
                        
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                                    <Info size={14} /> Details
                                </button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] border-l-border bg-card p-0 flex flex-col">
                                <div className="p-8 border-b border-border bg-muted/20">
                                    <SheetHeader>
                                        <SheetTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-foreground leading-tight">
                                            {sub.title}
                                        </SheetTitle>
                                        <div className="h-1 w-16 bg-sada-red mt-2 rounded-full" />
                                    </SheetHeader>
                                </div>
                                <div className="flex-1 p-8 overflow-y-auto">
                                    {/* (Kode detail sama seperti sebelumnya...) */}
                                    <p className="text-sm">Created at: {new Date(sub.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* --- TOMBOL UPDATE MENGAKTIFKAN isEditing --- */}
                        <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 size={14} /> Update Title
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />
                        
                        <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer rounded-lg"
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