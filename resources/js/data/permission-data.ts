export interface PermissionCardData {
    key: string;
    title: string;
    description: string;
}

export const PERMISSION_CARDS: PermissionCardData[] = [
    {
        key: 'manage-platform',
        title: 'Platform Control',
        description: 'Akses level tertinggi untuk mengelola seluruh tenant SaaS, billing, dan server logs.'
    },
    {
        key: 'manage-company',
        title: 'Workspace Settings',
        description: 'Wewenang manajerial untuk mengubah profil workspace, branding, dan informasi billing.'
    },
    {
        key: 'view-analytics',
        title: 'Analytics Viewer',
        description: 'Melihat performa tim dan statistik penggunaan workspace.'
    },
    {
        key: 'view-workspaces',
        title: 'Project Viewer',
        description: 'Akses dasar untuk masuk dan melihat isi workspace.'
    },
    {
        key: 'create-workspaces',
        title: 'Project Creator',
        description: 'Izin untuk menginisiasi workspace atau board proyek baru bagi tim.'
    },
    {
        key: 'edit-workspaces',
        title: 'Project Editor',
        description: 'Izin untuk mengubah nama dan setting proyek.'
    },
    {
        key: 'delete-workspaces',
        title: 'Project Destroyer',
        description: 'Izin kritis untuk menghapus proyek beserta seluruh isinya.'
    },
];