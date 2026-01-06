
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CEO at TechFlow",
    image: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2Mzg1MzA3MXww&ixlib=rb-4.1.0&q=80&w=1080",
    content: "Sada Taskly transformed how our team collaborates. We've seen a 40% increase in productivity and project delivery times have improved dramatically.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Product Manager at InnovateLabs",
    image: "https://images.unsplash.com/photo-1598268012815-ae21095df31b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzc3xlbnwxfHx8fDE3NjM5MjIyMTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "The best task management tool we've used. The interface is intuitive, the features are powerful, and the customer support is outstanding.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Operations Director at CloudScale",
    image: "https://images.unsplash.com/photo-1610896011476-300d6239d995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc3dvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NjM5NTc4MzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "Managing multiple teams was chaotic until we found Sada Taskly. Now everything is organized, transparent, and efficient. Game-changer!",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-6">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Loved by Teams <span className="text-red-600">Worldwide</span>
          </h2>
          <p className="text-lg text-gray-500">
            Join thousands of teams who have transformed their workflow and achieved peak productivity with Sada Taskly.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-red-100"
            >
              {/* Quote Icon - Warna Merah Sada */}
              <div className="absolute -top-5 left-8 w-11 h-11 bg-[#E30613] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
                <Quote className="w-5 h-5 text-white fill-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-5 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 mb-8 italic leading-relaxed text-sm md:text-base">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{testimonial.name}</div>
                  <div className="text-xs text-gray-500 truncate">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats - Tipografi Lebih Kuat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 py-12 px-8 rounded-[40px] bg-gray-50 border border-gray-100">
          <StatItem value="10,000+" label="Active Teams" />
          <StatItem value="500K+" label="Tasks Completed" />
          <StatItem value="4.9/5" label="Average Rating" />
          <StatItem value="99.9%" label="Uptime Guarantee" />
        </div>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center group">
      <div className="text-2xl md:text-4xl font-black text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
        {value}
      </div>
      <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}