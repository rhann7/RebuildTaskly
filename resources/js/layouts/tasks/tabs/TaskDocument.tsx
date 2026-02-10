import { useState } from 'react';
import { 
    FileIcon, 
    ImageIcon, 
    FileTextIcon, 
    Download, 
    Search, 
    LayoutGrid, 
    FileX,
    ExternalLink,
    Filter,
    HardDrive,
    Database
} from 'lucide-react';

interface Props {
    task: any;
}

export const TaskDocuments = ({ task }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");

    const documents = [
        { id: 1, name: 'ui_final_v2_dashboard.png', size: '4.2 MB', type: 'image', date: '10 Feb 2026', uploader: 'Andyto' },
        { id: 2, name: 'api_integration_flow.pdf', size: '1.8 MB', type: 'pdf', date: '09 Feb 2026', uploader: 'Michael Chen' },
        { id: 3, name: 'sprint_report_q1.xlsx', size: '920 KB', type: 'excel', date: '08 Feb 2026', uploader: 'Sarah Mitchell' },
    ];

    const filteredDocuments = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="text-blue-500" size={32} />;
            case 'excel': return <FileTextIcon className="text-emerald-500" size={32} />;
            case 'pdf': return <FileIcon className="text-sada-red" size={32} />;
            default: return <FileIcon className="text-muted-foreground" size={32} />;
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- TOP CONTROL BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card border border-border p-6 rounded-[32px] shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="SEARCH MISSION ASSETS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/50 border-border rounded-2xl pl-13 pr-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-sada-red outline-none transition-all shadow-inner text-foreground placeholder:text-muted-foreground/50 "
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-muted/50 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95">
                        <Filter size={14} /> Filter Type
                    </button>
                    <div className="h-10 w-px bg-border hidden md:block mx-2" />
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-background border border-border rounded-2xl shadow-sm">
                        <HardDrive size={14} className="text-sada-red animate-pulse" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-tighter ">Vault: 1.2 GB / 5 GB</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* --- MAIN GRID AREA --- */}
                <div className="lg:col-span-3">
                    {filteredDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDocuments.map((doc) => (
                                <div key={doc.id} className="group bg-card border border-border rounded-[40px] p-6 hover:border-sada-red/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-sada-red/5 flex flex-col gap-5">
                                    {/* Preview Box */}
                                    <div className="aspect-video bg-muted/30 rounded-[28px] flex flex-col items-center justify-center border border-dashed border-border group-hover:bg-muted/50 transition-colors relative overflow-hidden">
                                        <div className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-background p-2 rounded-xl shadow-lg border border-border">
                                                <ExternalLink size={14} className="text-sada-red" />
                                            </div>
                                        </div>
                                        <div className="group-hover:scale-110 transition-transform duration-500">
                                            {getFileIcon(doc.type)}
                                        </div>
                                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-5 ">Encrypted Data</span>
                                    </div>

                                    {/* File Info */}
                                    <div className="flex flex-col gap-1 px-2">
                                        <h4 className="text-[13px] font-black text-foreground uppercase truncate  leading-tight group-hover:text-sada-red transition-colors">
                                            {doc.name}
                                        </h4>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                    {doc.size} <span className="mx-1 text-border">|</span> {doc.date}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="size-1.5 rounded-full bg-sada-red" />
                                                    <span className="text-[9px] font-black text-foreground uppercase opacity-80 ">
                                                        Source: {doc.uploader}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="size-10 bg-foreground text-background rounded-2xl flex items-center justify-center hover:bg-sada-red hover:text-white transition-all shadow-xl active:scale-90">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 bg-muted/20 border-2 border-dashed border-border rounded-[48px] opacity-40">
                            <FileX size={64} className="text-muted-foreground mb-6" />
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ">No intelligence assets identified</p>
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR: REPOSITORY SUMMARY --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-[40px] p-10 relative overflow-hidden shadow-sm group">
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.08] rotate-12 group-hover:scale-110 transition-transform duration-700 text-foreground">
                            <Database size={180} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.3em] ">Intelligence Repository</span>
                                <h4 className="text-3xl font-black uppercase text-foreground  tracking-tighter leading-none">Archive</h4>
                            </div>

                            <div className="space-y-6">
                                <AssetStat label="Images" count="08" color="text-blue-500" />
                                <AssetStat label="Documents" count="03" color="text-sada-red" />
                                <AssetStat label="Spreadsheets" count="05" color="text-emerald-500" />
                            </div>

                            <div className="pt-6 border-t border-border">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase leading-relaxed tracking-widest  opacity-60">
                                    Archive system v.2.0 active. All files are indexed via member log transmissions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-muted/30 border border-border rounded-[40px] relative overflow-hidden group">
                        <div className="size-2 bg-sada-red rounded-full absolute top-8 right-8 animate-ping" />
                        <span className="text-[8px] font-black text-sada-red uppercase  block mb-3 ">Notes</span>
                        <p className="text-[10px] font-bold  uppercase opacity-80">
                            All intelligence assets are protected with end-to-end encryption. Unauthorized access attempts will be logged and reported.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssetStat = ({ label, count, color }: any) => (
    <div className="flex justify-between items-center border-b border-border pb-4 last:border-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ">{label}</span>
        <span className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{count}</span>
    </div>
);