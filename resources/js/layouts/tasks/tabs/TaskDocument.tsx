import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
    FileIcon, ImageIcon, FileTextIcon, Download, Search, 
    FileX, ExternalLink, HardDrive, Database, 
    UploadCloud, Plus, Loader2, Trash2, PieChart, Activity
} from 'lucide-react';

interface Props {
    task: any; 
}

export const TaskDocuments = ({ task }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documents = task.documents || [];

    // --- LOGIC TAMBAHAN UNTUK SIDEBAR STATS ---
    const totalFiles = documents.length;
    const imagesCount = documents.filter((d: any) => ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(d.file_type.toLowerCase())).length;
    const docsCount = documents.filter((d: any) => ['pdf', 'doc', 'docx', 'txt', 'xlsx'].includes(d.file_type.toLowerCase())).length;
    const othersCount = totalFiles - (imagesCount + docsCount);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const url = `/workspaces/${task.project.workspace.slug}/projects/${task.project.slug}/tasks/${task.slug}/documents`;

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
        const t = type.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(t)) return <ImageIcon className="text-blue-500" size={32} />;
        if (['xlsx', 'xls', 'csv'].includes(t)) return <FileTextIcon className="text-emerald-500" size={32} />;
        if (t === 'pdf') return <FileIcon className="text-red-500" size={32} />;
        return <FileIcon className="text-muted-foreground" size={32} />;
    };

    const filteredDocuments = documents.filter((doc: any) => 
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        placeholder="SEARCH ASSETS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/50 border-border rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Activity size={12} className="text-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase">System Online</span>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
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
                                <div key={doc.id} className="group bg-card border border-border rounded-[40px] p-6 hover:border-red-500/40 transition-all duration-300 shadow-sm flex flex-col gap-5">
                                    <div className="aspect-video bg-muted/30 rounded-[28px] flex items-center justify-center relative overflow-hidden border border-dashed border-border/50">
                                        <a href={doc.file_url} target="_blank" className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-background p-2 rounded-xl border border-border hover:bg-red-500 hover:text-white shadow-lg">
                                                <ExternalLink size={14} />
                                            </div>
                                        </a>
                                        <div className="aspect-video bg-muted/30 rounded-[28px] flex items-center justify-center relative overflow-hidden border border-dashed border-border/50 group-hover:bg-muted/50 transition-colors">
                                            {/* Action Overlay (Open Link) */}
                                            <a href={doc.file_url} target="_blank" className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                                <div className="bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border hover:bg-red-500 hover:text-white shadow-lg">
                                                    <ExternalLink size={14} />
                                                </div>
                                            </a>

                                            {/* PREVIEW LOGIC */}
                                            {['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(doc.file_type.toLowerCase()) ? (
                                                <img 
                                                    src={doc.file_url} 
                                                    alt={doc.file_name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    // Tambahin loading="lazy" biar gak berat pas dokumennya banyak
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="group-hover:scale-110 transition-transform duration-500">
                                                    {getFileIcon(doc.file_type)}
                                                </div>
                                            )}
                                            
                                            {/* Dark Overlay pas di Hover (Optional biar teks icon external lebih kelihatan) */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 px-2">
                                        <h4 className="text-[13px] font-black uppercase truncate group-hover:text-red-500 transition-colors">{doc.file_name}</h4>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{doc.file_size}</span>
                                                <span className="text-[9px] font-black text-foreground/50 uppercase">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleDelete(doc.id)} className="size-9 bg-muted text-muted-foreground rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"><Trash2 size={15} /></button>
                                                <a href={doc.file_url} download className="size-9 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"><Download size={15} /></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed border-border rounded-[48px] bg-muted/10">
                            <UploadCloud size={48} className="mx-auto mb-4 text-muted-foreground/40" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">No assets in secure vault</p>
                        </div>
                    )}
                </div>

                {/* --- IMPROVED SIDEBAR SUMMARY --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-[40px] p-8 relative overflow-hidden shadow-sm group">
                        {/* Decorative Icon Background */}
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.1] -rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <Database size={200} />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Vault Summary</span>
                                <h4 className="text-3xl font-black uppercase text-foreground tracking-tighter">Archive</h4>
                            </div>

                            <div className="space-y-6">
                                {/* Total Files Stat */}
                                <div className="flex justify-between items-end border-b border-border pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Capacity</span>
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Unlimited</span>
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
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(imagesCount / totalFiles) * 100 || 0}%` }} />
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
                                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(docsCount / totalFiles) * 100 || 0}%` }} />
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
                                            <div className="h-full bg-zinc-400 transition-all duration-1000" style={{ width: `${(othersCount / totalFiles) * 100 || 0}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Secure Vault Badge */}
                                <div className="mt-8 p-5 bg-muted/50 rounded-3xl border border-border/50 flex items-center gap-4 group/badge">
                                    <div className="size-10 rounded-2xl bg-background border border-border flex items-center justify-center shadow-inner group-hover/badge:scale-110 transition-transform">
                                        <HardDrive size={18} className="text-red-500" />
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