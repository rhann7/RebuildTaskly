import { FolderKanban } from 'lucide-react';

export const NoDataSignal = () => (
    <div className="py-40 text-center flex flex-col items-center">
        <FolderKanban size={64} className="mb-6 text-muted-foreground/10" />
        <p className="uppercase tracking-[0.5em] text-muted-foreground text-[10px] font-black opacity-50">
            Zero Data Signals Detected
        </p>
    </div>
);