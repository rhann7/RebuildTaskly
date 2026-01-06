// src/data/workspace-data.ts

export const WORKSPACES_DUMMY = [
    {
        id: 1,
        name: "Product Development",
        description: "Building the next generation of our platform with cutting-edge technology",
        color: "bg-purple-500",
        gradient: "from-purple-400 to-purple-500",
        tasks: { total: 45, completed: 32, inProgress: 8, pending: 5 },
        members: [
            { name: "Michael Chen", avatar: "https://images.unsplash.com/..." },
            { name: "Emma Rodriguez", avatar: "https://images.unsplash.com/..." },
            { name: "James Wilson", avatar: "https://images.unsplash.com/..." }
        ],
        totalMembers: 12,
        progress: 71,
        lastActivity: "2 hours ago",
        status: "active",
        isFavorite: true,
        avatar : "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=100&q=80"
    },
    {
        id: 2,
        name: "Marketing Campaign",
        description: "Launching a new marketing campaign to boost sales and engagement",
        color: "bg-blue-500",
        gradient: "from-blue-400 to-blue-500",
        tasks: { total: 30, completed: 20, inProgress: 5, pending: 5 },
        members: [
            { name: "Michael Chen", avatar: "https://images.unsplash.com/..." },
            { name: "Emma Rodriguez", avatar: "https://images.unsplash.com/..." },
            { name: "James Wilson", avatar: "https://images.unsplash.com/..." }
        ],
        totalMembers: 8,
        progress: 50,
        lastActivity: "1 day ago",
        status: "active",
        isFavorite: false,
        avatar : "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=100&q=80"
    },
    {
        id: 3,
        name: "Customer Support",
        description: "Providing exceptional customer support and ensuring a positive experience",
        color: "bg-green-500",
        gradient: "from-green-400 to-green-500",
        tasks: { total: 25, completed: 18, inProgress: 5, pending: 2 },
        members: [
            { name: "Michael Chen", avatar: "https://images.unsplash.com/..." },
            { name: "Emma Rodriguez", avatar: "https://images.unsplash.com/..." },
            { name: "James Wilson", avatar: "https://images.unsplash.com/..." }
        ],
        totalMembers: 15,
        progress: 53,
        lastActivity: "3 days ago",
        status: "active",
        isFavorite: true,
        avatar : "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=100&q=80"
    },
];