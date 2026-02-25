import { useState, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    FileIcon, ImageIcon, FileTextIcon, Download, Search, 
    ExternalLink, HardDrive, Database, 
    UploadCloud, Plus, Loader2, Trash2, Activity,
    Archive, Link2
} from 'lucide-react';

interface Props {
    task: any; 
}

export const TaskDocuments = ({ task }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // =====================================================================
    // LOGIKA PENGUMPUL SEMUA ATTACHMENT (THE VAULT AGGREGATOR)
    // =====================================================================
    const allDocuments = useMemo(() => {
        // 1. Ambil dokumen utama dari Task
        let docs = (task.documents || []).map((d: any) => ({
            ...d,
            sourceType: 'Task Asset' // Penanda asal file
        }));

        // 2. Jika Subtask punya dokumen, kumpulkan juga (Persiapan masa depan)
        if (task.subtasks && Array.isArray(task.subtasks)) {
            task.subtasks.forEach((sub: any) => {
                if (sub.documents && Array.isArray(sub.documents)) {
                    const subDocs = sub.documents.map((d: any) => ({
                        ...d,
                        sourceType: `Subtask: ${sub.title}`
                    }));
                    docs = [...docs, ...subDocs];
                }
            });
        }

        // 3. Jika ada komentar dengan dokumen, bisa ditambah di sini nanti
        
        // Urutkan berdasarkan yang paling baru
        return docs.sort((a: { created_at: string | number | Date; }, b: { created_at: string | number | Date; }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [task]);

    // --- LOGIC STATS ---
    const totalFiles = allDocuments.length;
    const imagesCount = allDocuments.filter((d: any) => d.file_type && ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(d.file_type.toLowerCase())).length;
    const docsCount = allDocuments.filter((d: any) => d.file_type && ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'csv'].includes(d.file_type.toLowerCase())).length;
    const othersCount = totalFiles - (imagesCount + docsCount);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const url = `/workspaces/${task.project?.workspace?.slug}/projects/${task.project?.slug}/tasks/${task.slug}/documents`;

        router.post(url, formData, {
            onBefore: () => setIsUploading(true),
            onFinish: () => {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (docId: number) => {
        if (confirm('Erase this asset from the vault?')) {
            router.delete(`/documents/${docId}`, { preserveScroll: true });
        }
    };

    const getFileIcon = (type: string) => {
        if (!type) return <FileIcon className="text-muted-foreground" size={32} />;
        const t = type.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(t)) return <ImageIcon className="text-blue-500" size={32} />;
        if (['xlsx', 'xls', 'csv'].includes(t)) return <FileTextIcon className="text-emerald-500" size={32} />;
        if (t === 'pdf') return <FileIcon className="text-red-500" size={32} />;
        return <FileIcon className="text-muted-foreground" size={32} />;
    };

    const filteredDocuments = allDocuments.filter((doc: any) => 
        doc.file_name && doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

            {/* --- TOP CONTROL BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card border border-border p-6 rounded-[32px] shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="SEARCH ALL ASSETS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/50 border-border rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-sada-red outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Activity size={12} className="text-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase">System Online</span>
                    </div>
                    {/* BUTTON UPLOAD TETAP ADA SEBAGAI MAIN ATTACHMENT */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sada-red hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-black/5"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />} 
                        {isUploading ? 'Transmitting...' : 'Upload Asset'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* --- MAIN CONTENT AREA --- */}
                <div className="lg:col-span-3">
                    {filteredDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDocuments.map((doc: any) => (
                                <div key={doc.id} className="group bg-card border border-border rounded-[40px] p-6 hover:border-sada-red/40 transition-all duration-300 shadow-sm flex flex-col gap-5 relative overflow-hidden">
                                    
                                    {/* BADGE SUMBER FILE (Dari Task atau Subtask) */}
                                    <div className="absolute top-0 left-0 bg-muted px-4 py-1.5 rounded-br-2xl border-b border-r border-border flex items-center gap-1.5 z-20">
                                        <Link2 size={10} className="text-muted-foreground" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                            {doc.sourceType}
                                        </span>
                                    </div>

                                    <div className="aspect-video bg-muted/30 rounded-[28px] flex items-center justify-center relative overflow-hidden border border-dashed border-border/50 mt-4">
                                        <div className="absolute inset-0 group-hover:bg-black/5 transition-colors z-10 pointer-events-none" />
                                        
                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                            <div className="bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border hover:bg-sada-red hover:text-white shadow-lg">
                                                <ExternalLink size={14} />
                                            </div>
                                        </a>

                                        {doc.file_type && ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(doc.file_type.toLowerCase()) ? (
                                            <img 
                                                src={doc.file_url} 
                                                alt={doc.file_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="group-hover:scale-110 transition-transform duration-500">
                                                {getFileIcon(doc.file_type)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 px-2">
                                        <h4 className="text-[13px] font-black uppercase truncate group-hover:text-sada-red transition-colors" title={doc.file_name}>
                                            {doc.file_name}
                                        </h4>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{doc.file_size || 'Unknown Size'}</span>
                                                <span className="text-[9px] font-black text-foreground/50 uppercase">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex gap-2 relative z-20">
                                                <button onClick={() => handleDelete(doc.id)} className="size-9 bg-muted text-muted-foreground rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                                <a href={doc.file_url} download className="size-9 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl flex items-center justify-center hover:bg-sada-red hover:text-white transition-all shadow-lg active:scale-90" title="Download">
                                                    <Download size={15} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed border-border rounded-[48px] bg-muted/10 flex flex-col items-center justify-center">
                            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-inner relative">
                                <Archive size={32} className="text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-2">Vault is Empty</h3>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground max-w-md mx-auto leading-relaxed">
                                No files or assets have been attached to this operational task yet. Use the upload button above to secure files.
                            </p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-8 px-8 py-3 bg-white dark:bg-zinc-900 text-sada-red border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sada-red hover:text-white transition-all shadow-sm"
                            >
                                Browse Files
                            </button>
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR SUMMARY --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-[40px] p-8 relative overflow-hidden shadow-sm group">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.1] -rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <Database size={200} />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.3em]">Vault Summary</span>
                                <h4 className="text-3xl font-black uppercase text-foreground tracking-tighter">Archive</h4>
                            </div>

                            <div className="space-y-6">
                                {/* Total Files Stat */}
                                <div className="flex justify-between items-end border-b border-border pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Capacity</span>
                                        <span className="text-[9px] font-black text-sada-red uppercase tracking-widest">Unlimited</span>
                                    </div>
                                    <span className="text-4xl font-black font-mono tracking-tighter">{totalFiles.toString().padStart(2, '0')}</span>
                                </div>

                                {/* Distribution Breakdown */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-blue-500" />
                                                <span>Images</span>
                                            </div>
                                            <span>{imagesCount}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(imagesCount / Math.max(1, totalFiles)) * 100}%` }} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-emerald-500" />
                                                <span>Documents</span>
                                            </div>
                                            <span>{docsCount}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(docsCount / Math.max(1, totalFiles)) * 100}%` }} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-zinc-400" />
                                                <span>Other Assets</span>
                                            </div>
                                            <span>{othersCount}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-zinc-400 transition-all duration-1000" style={{ width: `${(othersCount / Math.max(1, totalFiles)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Secure Vault Badge */}
                                <div className="mt-8 p-5 bg-muted/50 rounded-3xl border border-border/50 flex items-center gap-4 group/badge">
                                    <div className="size-10 rounded-2xl bg-background border border-border flex items-center justify-center shadow-inner group-hover/badge:scale-110 transition-transform">
                                        <HardDrive size={18} className="text-sada-red" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Encryption</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase italic">AES-256 Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};