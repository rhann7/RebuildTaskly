
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const PROJECTS_STATS = [
    {
        title: "Total Projects",
        value: "24",
        change: "+3 this month",
        icon: FolderKanban,
        color: "from-purple-400 to-purple-500"
    },
    {
        title: "In Progress",
        value: "12",
        change: "Active now",
        icon: Clock,
        color: "from-blue-400 to-blue-500"
    },
    {
        title: "Completed",
        value: "8",
        change: "+2 this week",
        icon: CheckCircle,
        color: "from-green-400 to-green-500"
    },
    {
        title: "Overdue",
        value: "4",
        change: "Need attention",
        icon: AlertCircle,
        color: "from-red-400 to-red-500"
    }
];