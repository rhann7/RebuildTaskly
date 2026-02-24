import { LucideIcon } from 'lucide-react';

interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export const SimpleTabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
    return (
        <div className="flex gap-2 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/30 w-fit rounded-2xl border border-zinc-200/50 dark:border-white/5">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${isActive
                                ? 'bg-white dark:bg-zinc-900 text-red-600 shadow-sm border border-zinc-200 dark:border-white/10 ring-1 ring-black/5'
                                : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={14} strokeWidth={isActive ? 3 : 2} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};