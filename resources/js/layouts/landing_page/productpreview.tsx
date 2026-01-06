import { ImageWithFallback } from "@/components/ImageWithFallback";


export function ProductPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Preview Image Container */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl"></div>
          
          {/* Main Preview Card */}
          <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-3 sm:p-6 border border-gray-100">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageWithFallback
                src="/images/landing/sada_landing.png" 
                className="w-full h-auto"
              />
              
              {/* Overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="hidden lg:block absolute -left-8 top-1/4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-6 border border-gray-100 max-w-[200px]">
            <div className="text-purple-600 mb-2">Tasks Completed</div>
            <div className="text-gray-900">2,847</div>
            <div className="text-green-500 mt-2">↑ 23% this week</div>
          </div>

          <div className="hidden lg:block absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-6 border border-gray-100 max-w-[200px]">
            <div className="text-pink-600 mb-2">Team Productivity</div>
            <div className="text-gray-900">94%</div>
            <div className="text-green-500 mt-2">↑ 12% efficiency</div>
          </div>
        </div>
      </div>
    </section>
  );
}
