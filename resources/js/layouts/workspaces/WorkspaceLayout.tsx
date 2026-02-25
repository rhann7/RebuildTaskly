import AppLayout from '@/layouts/app-layout';
import { LayoutGrid, Users2, Settings } from 'lucide-react';
import { WorkspaceHeader } from './partials/WorkspaceShowHeader'; 
import { SimpleTabs } from '@/components/custom/SimpleTabs';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal'; 
import { useState } from 'react';

// TAMBAHKAN memberCount dan projectCount di sini
export default function WorkspaceShowLayout({ 
    children, 
    workspace, 
    projects, 
    activeTab, 
    setActiveTab,
    memberCount, // <--- TANGKAP INI
    projectCount  // <--- TANGKAP INI
}: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tabs = [
        { id: 'projects', label: 'Projects', icon: LayoutGrid },
        { id: 'members', label: 'Members', icon: Users2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-6 p-6 md:p-10 min-h-screen">

                {/* --- PERBAIKAN DI SINI --- */}
                <WorkspaceHeader 
                    workspace={workspace} 
                    projectCount={projectCount || 0} // Pake data dari controller
                    memberCount={memberCount || 0}   // KIRIM DATA INI KE HEADER
                    onAddProject={() => setIsModalOpen(true)} 
                />

                <SimpleTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div className="w-full flex-1">
                    {children}
                </div>
            </div>

            <CreateProjectModal 
                isOpen={isModalOpen} 
                setIsOpen={setIsModalOpen} 
                workspace={workspace} 
            />
        </AppLayout>
    );
}