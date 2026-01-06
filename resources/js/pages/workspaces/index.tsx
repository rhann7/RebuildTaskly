import AppLayout from '@/layouts/app-layout';
import { dashboard, } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Page, revealProgress } from '@inertiajs/core';
import { act, useState } from "react";
import { WorkspaceHeader } from "@/layouts/workspace/WorkspaceHeader";
import { WorkspaceControls } from "@/layouts/workspace/WorkspaceControls";
import { WorkspaceCard } from "@/layouts/workspace/WorkspaceCard";
import { WorkspaceStats } from "@/layouts/workspace/WorkspacesStats";
import { WORKSPACES_DUMMY } from "@/data/workspace-data";

interface WorkspacesProps extends Page {
    auth: {
        user: {
            name: string;
            email: string;
            company?: { name: string };
            roles?: string[];
        };
        permissions: string[];
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspaces', href: dashboard().url },
];

export default function Workspaces() {
    const { props } = usePage<WorkspacesProps>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default ke list sesuai permintaan sebelumnya
    const [searchQuery, setSearchQuery] = useState('');

    // Filter menggunakan data dari import
    const filteredWorkspaces = WORKSPACES_DUMMY.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Workspaces" />
            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 transition-all">

                <WorkspaceHeader
                    title="Workspaces"
                    description="Monitor and manage all your active team environments."
                />

                <WorkspaceStats />

                <WorkspaceControls
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500'
                    : 'flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500'
                }>
                    {filteredWorkspaces.map((workspace) => (
                        <WorkspaceCard
                            key={workspace.id}
                            workspace={workspace}
                            viewMode={viewMode}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {filteredWorkspaces.length === 0 && (
                    <div className="..."> {/* Kode Empty State Anda */} </div>
                )}
            </div>
        </AppLayout>
    );
}