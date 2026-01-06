import { Users, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "../../components/ImageWithFallback";

interface MemberProps {
    name: string;
    role: string;
    avatar: string;
    tasks: number;
    online: boolean;
    color?: string; // Menambahkan opsi warna background ikon seperti di screenshot
}

export const TeamMembers = ({ members }: { members: MemberProps[] }) => (
    <div className="">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Team Performance</h2>
                <p className="text-xs text-muted-foreground mt-1">Activity ranking this week</p>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 bg-sada-red/10 text-sada-red rounded-full uppercase tracking-wider">
                {members.length} Members
            </span>
        </div>

        <div className="space-y-6">
            {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                        {/* Avatar dengan Ring Status */}
                        <div className="relative shrink-0">
                            <div className={`p-0.5 rounded-full border-2 ${member.online ? 'border-emerald-500' : 'border-transparent'}`}>
                                <ImageWithFallback
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-11 h-11 rounded-full object-cover border border-border bg-muted"
                                />
                            </div>
                            {member.online && (
                                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full shadow-sm"></div>
                            )}
                        </div>

                        {/* Info Member */}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground truncate group-hover:text-sada-red transition-colors">
                                {member.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium truncate">
                                {member.role}
                            </div>
                        </div>
                    </div>

                    {/* Task Counter (Gaya Badge Minimalis) */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-[13px] font-black text-foreground">
                            {member.tasks}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                            Tasks
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* View All Button (Gaya Screenshot) */}
        <Button 
            variant="outline" 
            className="w-full mt-8 h-12 rounded-2xl border-border bg-card text-foreground font-bold hover:bg-muted transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
            <LayoutGrid className="w-4 h-4 text-muted-foreground group-hover:text-sada-red transition-colors" />
            View All Members
        </Button>
    </div>
);