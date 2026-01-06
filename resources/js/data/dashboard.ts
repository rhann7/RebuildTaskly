import { FolderKanban, Users, CheckCircle, TrendingUp } from "lucide-react";

export const DASHBOARD_STATS_DUMMY = [
    {
        title: "Active Workspaces",
        value: "12",
        change: "+2 this month",
        icon: FolderKanban,
        color: "from-purple-500 to-indigo-600"
    },
    {
        title: "Total Members",
        value: "47",
        change: "+5 new members",
        icon: Users,
        color: "from-blue-500 to-cyan-600"
    },
    {
        title: "Tasks Completed",
        value: "2,847",
        change: "+23% this week",
        icon: CheckCircle,
        color: "from-emerald-500 to-teal-600"
    },
    {
        title: "Productivity",
        value: "94%",
        change: "+12% efficiency",
        icon: TrendingUp,
        color: "from-sada-red to-orange-600"
    }
];