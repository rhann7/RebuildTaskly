import { useState, useMemo } from 'react'; // Tambah useMemo biar efisien
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { TaskDetailHeader } from '@/layouts/tasks/partials/TasksDetailHeader';
import { TaskDetailTabs } from '@/layouts/tasks/tabs/TabsDetailTasks';
import { TaskOverview } from '@/layouts/tasks/tabs/TaskOverview';
import { TaskDocuments } from '@/layouts/tasks/tabs/TaskDocument';
import { TaskTimesheetTab } from '@/layouts/tasks/tabs/TaskTimesheetTab';

export default function TaskShow({ workspace, project, task, isManager }: any) {
    const [activeTab, setActiveTab] = useState<'brief' | 'logs' | 'docs' | 'activity'>('brief');

    // 1. HITUNG PROGRESS SECARA REALTIME
    // Setiap kali task di-update (misal checklist diklik), progress bakal kehitung ulang
    const progressPercent = useMemo(() => {
        const total = task.subtasks?.length || 0;
        if (total === 0) return 0;
        const completed = task.subtasks.filter((s: any) => s.is_completed).length;
        return Math.round((completed / total) * 100);
    }, [task.subtasks]);

    // Masukkan progress ke object task buat dipake di header & overview
    const enrichedTask = { ...task, progress: progressPercent };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
        { title: project.name, href: `/workspaces/${workspace.slug}/projects/${project.slug}` },
        { title: 'Tasks', href: `/workspaces/${workspace.slug}/projects/${project.slug}/tasks` },
        { title: task.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${task.title} - Task Detail`} />

            <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">

                {/* 2. OPER PROJECT JUGA KE SINI */}
                <TaskDetailHeader task={enrichedTask} project={project} workspace={workspace} />

                <TaskDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="min-h-[600px] transition-all duration-500">
                    {activeTab === 'brief' &&
                        <TaskOverview
                            workspace={workspace}
                            project={project}
                            task={enrichedTask}
                            isManager={isManager}
                        />}
                    {activeTab === 'logs' && (
                        <div className="bg-white dark:bg-zinc-900/40 border border-border rounded-[40px] overflow-hidden p-8 shadow-2xl mt-6">
                            <TaskTimesheetTab task={task} isManager={isManager} />
                        </div>
                    )}
                    {activeTab === 'docs' &&
                        <TaskDocuments
                            task={enrichedTask} />}
                    {activeTab === 'activity' &&
                        <TaskTimesheetTab task={enrichedTask} isManager={isManager} />
                    }
                </div>

            </div>
        </AppLayout >
    );
}