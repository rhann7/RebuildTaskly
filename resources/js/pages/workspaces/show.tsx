// resources/js/pages/workspaces/show.tsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';

export default function WorkspaceShow({ workspace, projects }: any) {
    const [activeTab, setActiveTab] = useState('projects');

    return (
        <WorkspaceLayout 
            workspace={workspace} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            <Head title={`${workspace.name} - Detail`} />

            {/* Konten berubah sesuai tab yang dipilih di Layout */}
            {activeTab === 'projects' && (
                <div className="animate-in fade-in duration-500">
                    {/* Kamu bisa panggil komponen ProjectTable di sini */}
                    <h2 className="text-xl font-bold mb-4">Project List</h2>
                    {/* <ProjectTable data={projects} /> */}
                    
                </div>
            )}

            {activeTab === 'members' && (
                <div className="animate-in fade-in duration-500 py-10 text-center border rounded-xl border-dashed">
                    <p className="text-muted-foreground">Members management coming soon.</p>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-xl font-bold mb-4">Settings</h2>
                    {/* Form edit workspace di sini */}
                </div>
            )}
        </WorkspaceLayout>
    );
}