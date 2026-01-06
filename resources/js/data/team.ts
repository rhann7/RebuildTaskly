export const TEAMS_DUMMY = [
    {
        id: "USR-001",
        name: "Andyto",
        email: "andyto@sada.co.id",
        role: "Senior Lead Developer",
        avatar: "https://i.pravatar.cc/150?u=andyto",
        workspace: "Product Tech",
        projects: ["Redesain Mobile Sigma App", "Internal API Gateway"],
        workload: 85, // Persentase kesibukan
        tasksCount: 12,
        status: "online"
    },
    {
        id: "USR-002",
        name: "Michael Chen",
        email: "michael@sada.co.id",
        role: "UI/UX Designer",
        avatar: "https://i.pravatar.cc/150?u=michael",
        workspace: "Design System",
        projects: ["Redesain Mobile Sigma App", "Sada Branding Kit"],
        workload: 40,
        tasksCount: 4,
        status: "busy"
    },
    {
        id: "USR-003",
        name: "Emma Rodriguez",
        email: "emma@sada.co.id",
        role: "Marketing Specialist",
        avatar: "https://i.pravatar.cc/150?u=emma",
        workspace: "Marketing Campaign",
        projects: ["Q4 Branding Awareness"],
        workload: 60,
        tasksCount: 7,
        status: "offline"
    }
];

export const TEAM_FILTERS = {
    workspaces: ["Product Tech", "Design System", "Marketing Campaign", "Customer Support"],
    roles: ["Developer", "Designer", "Manager", "Marketing"]
};