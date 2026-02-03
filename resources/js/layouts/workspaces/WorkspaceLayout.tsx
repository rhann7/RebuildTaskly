import AppLayout from '@/layouts/app-layout';
import { LayoutGrid, Users2, Settings } from 'lucide-react';
import { WorkspaceHeader } from './partials/WorkspaceShowHeader'; // Pastikan path file header lo bener
import { SimpleTabs } from '@/components/custom/SimpleTabs';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal'; // Import modalnya di sini
import { useState } from 'react';

export default function WorkspaceShowLayout({ children, workspace, projects, activeTab, setActiveTab }: any) {
    // State modal kita pindah ke layout atau pastikan sinkron dengan halaman
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

                {/* Header: Sekarang nerima prop onAddProject */}
                <WorkspaceHeader 
                    workspace={workspace} 
                    projectCount={projects?.length || 0} 
                    onAddProject={() => setIsModalOpen(true)} 
                />

                {/* Tab Navigation */}
                <SimpleTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Main Content Area */}
                <div className="w-full flex-1">
                    {children}
                </div>
            </div>

            {/* Modal ditaruh di level layout biar bisa dipicu dari header manapun */}
            <CreateProjectModal 
                isOpen={isModalOpen} 
                setIsOpen={setIsModalOpen} 
                workspace={workspace} 
            />
        </AppLayout>
    );
}