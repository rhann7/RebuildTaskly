import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section id="about" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decor - Membuat gradien lebih dinamis */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-50/50 via-white to-white"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge Trusted - Dibuat lebih slim dan elegan */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] mb-10 transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-600 tracking-wide uppercase">
              Trusted by 10,000+ teams worldwide
            </span>
          </div>

          {/* Main Heading - Tipografi lebih besar dan tegas */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight">
            Streamline Your Team's Workflow with <span className="text-red-600">Intelligent</span> Task Management
          </h1>

          {/* Subheading - Jarak antar baris lebih lega (relaxed) */}
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sada Taskly brings your teams, projects, and tasks together in one unified workspace. 
            Collaborate effortlessly and achieve more with less effort.
          </p>

          {/* CTA Buttons - Ukuran tombol diperbesar dan serasi */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 bg-[#E30613] hover:bg-red-700 text-white shadow-xl shadow-red-100 hover:shadow-red-200 transition-all px-10 rounded-2xl text-base font-bold group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-14 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-2xl px-10 text-base font-bold transition-all"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Features List - Menggunakan gaya Badge mini */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <HeroFeature text="No credit card required" />
            <HeroFeature text="14-day free trial" />
            <HeroFeature text="Cancel anytime" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Sub-komponen agar kode rapi
function HeroFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-sm font-medium text-gray-600">{text}</span>
    </div>
  );
}