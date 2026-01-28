import AppLayout from '@/layouts/app-layout';
import { LayoutGrid, Users2, Settings } from 'lucide-react';
import { WorkspaceHeader } from './partials/WorkspaceShowHeader';
import { SimpleTabs } from '@/components/custom/SimpleTabs';

export default function WorkspaceShowLayout({ children, workspace, activeTab, setActiveTab }: any) {
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
            {/* Gunakan max-w-[1600px] agar layout lega dan tidak berubah ukuran */}
            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-6 p-6 md:p-10 min-h-screen">

                {/* Header Bagian Atas */}
                <WorkspaceHeader workspace={workspace} projectCount={0} />

                {/* Tab Navigation - Dibungkus div agar kontrol posisi lebih mudah */}
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
        </AppLayout>
    );
}