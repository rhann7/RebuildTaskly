import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { TaskDetailHeader } from '@/layouts/tasks/partials/TasksDetailHeader';
import { TaskDetailTabs } from '@/layouts/tasks/tabs/TabsDetailTasks';
import { TaskOverview } from '@/layouts/tasks/tabs/TaskOverview';
import { TaskTimesheets } from '@/layouts/tasks/tabs/TasksTimesheets';
import { TaskDocuments } from '@/layouts/tasks/tabs/TaskDocument';


export default function TaskShow({ workspace, project, task, subtasks }: any) {
    const [activeTab, setActiveTab] = useState<'brief' | 'timesheets' | 'docs' | 'activity'>('brief');
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
                <TaskDetailHeader task={task} />

                <TaskDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="min-h-[600px] transition-all duration-500">
                    {activeTab === 'brief' && <TaskOverview task={task} />}
                    {activeTab === 'timesheets' && <TaskTimesheets task={task} />}
                    {activeTab === 'docs' && <TaskDocuments task={task} />}
                    {/* {activeTab === 'activity' && <TaskActionCenter task={task} />}  */}
                </div>
            </div>
        </AppLayout >
    );
}