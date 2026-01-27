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
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <WorkspaceHeader workspace={workspace} />

                <SimpleTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div className="mt-6">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}