import { Briefcase, CheckCircle, Clock, Video } from "lucide-react";

export const TIME_STATS_DUMMY = [
    {
        title: "Hours This Week",
        value: "38.5h",
        change: "4h today",
        icon: Clock,
        color: "from-purple-400 to-purple-500"
    },
    {
        title: "Tasks Completed",
        value: "24",
        change: "+6 this week",
        icon: CheckCircle,
        color: "from-green-400 to-green-500"
    },
    {
        title: "Meetings",
        value: "12",
        change: "3 upcoming",
        icon: Video,
        color: "from-blue-400 to-blue-500"
    },
    {
        title: "Projects Active",
        value: "5",
        change: "On track",
        icon: Briefcase,
        color: "from-orange-400 to-orange-500"
    }
];