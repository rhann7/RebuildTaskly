import { Clock, MoreVertical, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RecentTasks = ({ tasks }: { tasks: any[] }) => (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">View All Tasks</Button>
        </div>
        <div className="space-y-3">
            {tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-gray-100">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                        <div className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</div>
                        <div className="text-xs text-gray-500">{task.workspace}</div>
                    </div>
                    <Badge className={task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>{task.priority}</Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" />{task.dueDate}</div>
                </div>
            ))}
        </div>
    </div>
);