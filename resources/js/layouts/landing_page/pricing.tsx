import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "19",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 10 team members",
      "Unlimited tasks & projects",
      "5GB file storage",
      "Email support",
      "Mobile apps"
    ],
    isPopular: false,
    color: "from-slate-400 to-slate-500"
  },
  {
    name: "Professional",
    price: "49",
    description: "For growing teams that need more power",
    features: [
      "Up to 50 team members",
      "Unlimited tasks & projects",
      "50GB file storage",
      "Advanced analytics & reports",
      "Priority support",
      "Custom workflows",
      "API access"
    ],
    isPopular: true,
    color: "from-red-500 to-red-600" // Identitas Sada
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited team members",
      "Unlimited storage",
      "Advanced security",
      "Dedicated manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option"
    ],
    isPopular: false,
    color: "from-slate-800 to-slate-950"
  }
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-6">
            Pricing Plans
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Simple, <span className="text-red-600">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-500">
            Choose the perfect plan for your team. All plans include a 14-day free trial to get you started.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-[32px] p-8 transition-all duration-500 border ${
                plan.isPopular 
                  ? 'border-red-200 shadow-[0_20px_50px_rgba(227,6,19,0.1)] scale-105 z-10' 
                  : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E30613] text-white text-xs font-bold uppercase tracking-wider shadow-xl shadow-red-200">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  {plan.price !== "Custom" ? (
                    <>
                      <span className="text-4xl md:text-5xl font-black text-gray-900">${plan.price}</span>
                      <span className="text-gray-400 font-medium">/month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-gray-900">Custom</span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full h-12 mb-8 rounded-xl font-bold text-sm transition-all duration-300 ${
                  plan.isPopular 
                    ? 'bg-[#E30613] hover:bg-red-700 text-white shadow-lg shadow-red-100' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
              </Button>

              {/* Features List */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's included:</p>
                <ul className="space-y-3.5">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 group">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-110`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 rounded-[24px] bg-white border border-gray-100 shadow-sm max-w-2xl mx-auto transition-all hover:shadow-md">
          <p className="text-gray-600 font-medium">
            Need a custom solution for your large enterprise? <br className="hidden sm:block" /> 
            <a href="#contact" className="text-red-600 hover:text-red-700 font-bold underline decoration-2 underline-offset-4 transition-all">
               Talk to our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}