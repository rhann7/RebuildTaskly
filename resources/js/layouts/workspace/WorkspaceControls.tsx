import { Search, Filter, Grid3x3, List, X } from "lucide-react";
import { Input,  } from "@/components/ui/input"; // Menggunakan input standar Anda

interface WorkspaceControlsProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const WorkspaceControls = ({ 
    viewMode, 
    setViewMode, 
    searchQuery, 
    setSearchQuery 
}: WorkspaceControlsProps) => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card rounded-[24px] p-3 shadow-sm border border-border mb-8 transition-all">
        
        {/* Search Input Section */}
        <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
            <input
                type="text"
                placeholder="Search workspaces by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-12 rounded-2xl border-none bg-muted/30 focus:bg-background focus:ring-4 focus:ring-sada-red/10 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                    <X className="size-4 text-muted-foreground" />
                </button>
            )}
        </div>

        {/* Filters & View Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-background border border-border rounded-2xl px-5 h-12 text-sm font-bold text-foreground hover:bg-muted hover:border-sada-red/30 transition-all active:scale-95 shadow-sm">
                <Filter className="size-4 text-sada-red" /> 
                Filters
            </button>
            
            <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                <ViewToggle 
                    active={viewMode === 'grid'} 
                    onClick={() => setViewMode('grid')} 
                    icon={Grid3x3} 
                    label="Grid"
                />
                <ViewToggle 
                    active={viewMode === 'list'} 
                    onClick={() => setViewMode('list')} 
                    icon={List} 
                    label="List"
                />
            </div>
        </div>
    </div>
);

const ViewToggle = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        title={`View as ${label}`}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-background shadow-md text-sada-red scale-100 ring-1 ring-black/5' 
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 opacity-70'
        }`}
    >
        <Icon className="size-4" />
        {active && <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>}
    </button>
);