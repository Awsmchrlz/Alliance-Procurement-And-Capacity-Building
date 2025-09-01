import { GraduationCap, Handshake, ClipboardCheck, FileText, Users, Lightbulb } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: GraduationCap,
      title: "Capacity Building & Professional Development",
      description: "Comprehensive training programs designed to enhance procurement and supply chain management skills.",
    },
    {
      icon: Handshake,
      title: "Procurement Advisory & Technical Support", 
      description: "Expert guidance on procurement processes, planning, and implementation strategies.",
    },
    {
      icon: ClipboardCheck,
      title: "Compliance, Audit & Risk Management",
      description: "Comprehensive compliance assessment and procurement audit services for risk mitigation.",
    },
    {
      icon: FileText,
      title: "Tender Management & Evaluation",
      description: "Professional tender evaluation processes and management consulting services.",
    },
    {
      icon: Users,
      title: "Recruitment & Staffing Services",
      description: "Specialized recruitment services for procurement and supply chain professionals.",
    },
    {
      icon: Lightbulb,
      title: "Research & Thought Leadership",
      description: "Cutting-edge research and insights to drive innovation in supply chain management.",
    },
  ];

  return (
    <section id="services" className="py-20 bg-light-blue dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-blue dark:text-white mb-4" data-testid="services-title">
            OUR SERVICES
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive procurement and supply chain solutions designed to enhance your organization's capabilities and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              data-testid={`service-card-${index}`}
            >
              <div className="w-16 h-16 bg-primary-yellow rounded-xl flex items-center justify-center mb-6">
                <service.icon className="text-2xl text-primary-blue w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary-blue dark:text-white mb-4" data-testid={`service-title-${index}`}>
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6" data-testid={`service-description-${index}`}>
                {service.description}
              </p>
              <button className="text-primary-blue dark:text-primary-yellow hover:underline font-medium"
               data-testid={`service-learn-more-${index}`}
               onClick={() => {
                 // Navigate to services page with the specific service selected
                 window.location.href = `/services?service=${index}`;
               }}>
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
