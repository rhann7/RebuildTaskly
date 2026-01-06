import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceHeaderProps {
    title?: string;
    description?: string;
    buttonText?: string;
    onAction?: () => void;
}

export const WorkspaceHeader = ({ 
    title = "Workspaces", 
    description = "Manage and organize all your team workspaces in one place.",
    buttonText = "Create Workspace",
    onAction 
}: WorkspaceHeaderProps) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground transition-colors">
                {title}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
                {description}
            </p>
        </div>
        
        <Button 
            onClick={onAction}
            className="h-12 px-6 bg-sada-red hover:bg-sada-red-hover text-white rounded-2xl shadow-lg shadow-sada-red/20 transition-all font-bold flex items-center gap-2 group active:scale-95 border-none"
        >
            <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                <Plus size={18} className="text-white" strokeWidth={3} />
            </div>
            {buttonText}
        </Button>
    </div>
);