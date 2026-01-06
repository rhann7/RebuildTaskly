import { 
  Layout, 
  Users, 
  BarChart3, 
  Bell, 
  Lock, 
  Zap,
  Calendar,
  MessageSquare 
} from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Intuitive Workspace",
    description: "Organize projects, tasks, and teams in a clean, drag-and-drop interface designed for productivity.",
    color: "from-red-400 to-red-600" // Disamakan dengan brand Sada
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamlessly collaborate with team members through real-time updates, comments, and file sharing.",
    color: "from-slate-700 to-slate-900" // Aksen gelap profesional
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain insights into team performance, project progress, and resource allocation with detailed reports.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Plan ahead with integrated calendars, deadline tracking, and automated reminders for your team.",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Stay updated with instant notifications for task updates, mentions, and important changes.",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-level encryption, role-based access control, and compliance with industry standards.",
    color: "from-gray-700 to-gray-800"
  },
  {
    icon: Zap,
    title: "Powerful Automations",
    description: "Automate repetitive tasks with custom workflows, triggers, and integrations to save time.",
    color: "from-amber-500 to-amber-600"
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description: "Communicate instantly with built-in messaging, reducing the need for external communication tools.",
    color: "from-red-500 to-red-700"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-6">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Everything You Need to <span className="text-red-600">Scale</span> Your Business
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Powerful features designed to help teams of all sizes collaborate, organize, and achieve their goals faster without the complexity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 transition-all duration-300 border border-gray-100 hover:border-red-100 hover:shadow-[0_20px_50px_rgba(227,6,19,0.05)]"
            >
              {/* Icon dengan Glow Effect saat Hover */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative Line on Hover */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}