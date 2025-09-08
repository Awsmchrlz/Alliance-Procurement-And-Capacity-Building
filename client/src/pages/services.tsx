import { useState, useEffect } from "react";
import {
  GraduationCap,
  Handshake,
  ClipboardCheck,
  FileText,
  Users,
  Lightbulb,
  ArrowLeft,
  CheckCircle,
  Clock,
  Target,
  Award,
  TrendingUp,
  Shield,
  BookOpen,
  UserCheck,
  Search,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Services() {
  const [selectedService, setSelectedService] = useState(0);

  // Handle service selection from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      const serviceIndex = parseInt(serviceParam);
      if (serviceIndex >= 0 && serviceIndex < services.length) {
        setSelectedService(serviceIndex);
      }
    }
  }, []);

  const services = [
    {
      id: 0,
      icon: GraduationCap,
      title: "Capacity Building & Professional Development",
      shortDescription: "Comprehensive training programs designed to enhance procurement and supply chain management skills.",
      detailedDescription: "Our capacity building programs are designed to transform your team's procurement capabilities through comprehensive, hands-on training experiences. We combine theoretical knowledge with practical application to ensure lasting impact on your organization's performance.",
      keyFeatures: [
        "Customized training curricula tailored to your organization's needs",
        "Interactive workshops with real-world case studies",
        "Certification programs recognized by industry standards",
        "Mentorship and coaching support for continuous improvement",
        "Digital learning platforms for flexible skill development",
        "Performance measurement and progress tracking"
      ],
      benefits: [
        "Enhanced procurement decision-making capabilities",
        "Improved supplier relationship management",
        "Reduced procurement risks and costs",
        "Increased team confidence and competence",
        "Better compliance with procurement regulations",
        "Higher return on investment in procurement activities"
      ],
      duration: "2-12 weeks depending on program complexity",
      deliverables: [
        "Comprehensive training materials and resources",
        "Professional development certificates",
        "Post-training support and consultation",
        "Performance assessment reports"
      ],
      icon2: BookOpen
    },
    {
      id: 1,
      icon: Handshake,
      title: "Procurement Advisory & Technical Support",
      shortDescription: "Expert guidance on procurement processes, planning, and implementation strategies.",
      detailedDescription: "Our procurement advisory services provide strategic guidance and technical expertise to optimize your procurement operations. We work closely with your team to develop sustainable procurement strategies that drive value and efficiency.",
      keyFeatures: [
        "Strategic procurement planning and roadmap development",
        "Process optimization and workflow improvement",
        "Supplier market analysis and sourcing strategies",
        "Contract negotiation support and guidance",
        "Technology implementation consulting",
        "Procurement policy development and review"
      ],
      benefits: [
        "Streamlined procurement processes",
        "Cost savings through strategic sourcing",
        "Enhanced supplier portfolio management",
        "Improved procurement governance",
        "Better risk management and mitigation",
        "Increased operational efficiency"
      ],
      duration: "4-24 weeks based on project scope",
      deliverables: [
        "Procurement strategy documents",
        "Process improvement recommendations",
        "Supplier evaluation frameworks",
        "Implementation roadmaps and timelines"
      ],
      icon2: Target
    },
    {
      id: 2,
      icon: ClipboardCheck,
      title: "Compliance, Audit & Risk Management",
      shortDescription: "Comprehensive compliance assessment and procurement audit services for risk mitigation.",
      detailedDescription: "Our compliance and audit services ensure your procurement activities meet regulatory requirements while identifying and mitigating potential risks. We provide thorough assessments and actionable recommendations for continuous improvement.",
      keyFeatures: [
        "Comprehensive procurement compliance audits",
        "Risk assessment and mitigation strategies",
        "Regulatory compliance monitoring",
        "Internal control system evaluation",
        "Fraud prevention and detection programs",
        "Continuous monitoring and reporting systems"
      ],
      benefits: [
        "Reduced legal and financial risks",
        "Enhanced regulatory compliance",
        "Improved internal controls",
        "Greater transparency in procurement",
        "Protected organizational reputation",
        "Increased stakeholder confidence"
      ],
      duration: "3-8 weeks for comprehensive audit",
      deliverables: [
        "Detailed audit reports with findings",
        "Risk mitigation action plans",
        "Compliance monitoring frameworks",
        "Training recommendations for staff"
      ],
      icon2: Shield
    },
    {
      id: 3,
      icon: FileText,
      title: "Tender Management & Evaluation",
      shortDescription: "Professional tender evaluation processes and management consulting services.",
      detailedDescription: "Our tender management services ensure fair, transparent, and efficient procurement processes. We provide end-to-end support from tender preparation to contract award, ensuring best value for money and compliance with procurement regulations.",
      keyFeatures: [
        "Tender document preparation and review",
        "Comprehensive supplier evaluation processes",
        "Bid analysis and comparison methodologies",
        "Negotiation strategy development",
        "Contract award recommendations",
        "Post-award contract management support"
      ],
      benefits: [
        "Fair and transparent procurement processes",
        "Optimal value for money outcomes",
        "Reduced procurement cycle times",
        "Enhanced supplier competition",
        "Minimized procurement disputes",
        "Improved contract performance"
      ],
      duration: "2-16 weeks depending on tender complexity",
      deliverables: [
        "Professional tender documentation",
        "Evaluation criteria and methodologies",
        "Supplier assessment reports",
        "Contract award recommendations"
      ],
      icon2: Award
    },
    {
      id: 4,
      icon: Users,
      title: "Recruitment & Staffing Services",
      shortDescription: "Specialized recruitment services for procurement and supply chain professionals.",
      detailedDescription: "Our recruitment services connect organizations with top-tier procurement and supply chain professionals. We understand the unique requirements of these roles and provide comprehensive staffing solutions for both permanent and temporary positions.",
      keyFeatures: [
        "Executive search for senior procurement roles",
        "Specialized recruitment for technical positions",
        "Temporary and contract staffing solutions",
        "Skills assessment and competency evaluation",
        "Market salary benchmarking and analysis",
        "Onboarding support and integration planning"
      ],
      benefits: [
        "Access to pre-qualified talent pool",
        "Reduced time-to-hire for critical roles",
        "Improved quality of procurement hires",
        "Lower recruitment costs and risks",
        "Enhanced team capabilities",
        "Better cultural fit and retention rates"
      ],
      duration: "2-12 weeks depending on role complexity",
      deliverables: [
        "Qualified candidate shortlists",
        "Comprehensive candidate assessments",
        "Market intelligence reports",
        "Onboarding and integration plans"
      ],
      icon2: UserCheck
    },
    {
      id: 5,
      icon: Lightbulb,
      title: "Research & Thought Leadership",
      shortDescription: "Cutting-edge research and insights to drive innovation in supply chain management.",
      detailedDescription: "Our research services provide organizations with strategic insights, market intelligence, and innovative solutions to stay ahead in the rapidly evolving procurement landscape. We conduct thorough analysis to support informed decision-making.",
      keyFeatures: [
        "Market research and trend analysis",
        "Supplier market intelligence reports",
        "Best practice identification and benchmarking",
        "Innovation opportunity assessment",
        "Industry white papers and publications",
        "Strategic consulting based on research findings"
      ],
      benefits: [
        "Data-driven procurement decisions",
        "Competitive advantage through insights",
        "Improved market positioning",
        "Innovation-led growth opportunities",
        "Enhanced strategic planning capabilities",
        "Thought leadership in your industry"
      ],
      duration: "4-20 weeks based on research scope",
      deliverables: [
        "Comprehensive research reports",
        "Market intelligence dashboards",
        "Strategic recommendations",
        "Implementation roadmaps"
      ],
      icon2: TrendingUp
    }
  ];

  const currentService = services[selectedService];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="text-white py-12 sm:py-16 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Our <span style={{ color: '#87CEEB' }}>Services</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive procurement and capacity building solutions tailored to transform your organization's capabilities
            </p>
          </div>
        </div>
      </header>

      {/* Services Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide py-4">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => setSelectedService(index)}
                className={`flex-shrink-0 flex items-center space-x-3 px-6 py-3 mr-4 rounded-full transition-all duration-300 ${
                  selectedService === index
                    ? 'bg-[#1C356B] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <service.icon className="w-5 h-5" />
                <span className="font-medium whitespace-nowrap text-sm">
                  {service.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Detail Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">

          {/* Service Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 mb-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-[#87CEEB] rounded-2xl flex items-center justify-center mb-4">
                  <currentService.icon className="w-10 h-10 text-[#1C356B]" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1C356B] mb-4">
                  {currentService.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {currentService.detailedDescription}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-[#87CEEB]" />
                    Duration: {currentService.duration}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details Grid */}
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Key Features */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#1C356B] rounded-xl flex items-center justify-center mr-4">
                  <currentService.icon2 className="w-6 h-6 text-[#87CEEB]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1C356B]">Key Features</h3>
              </div>
              <div className="space-y-4">
                {currentService.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#87CEEB] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#87CEEB] rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-[#1C356B]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1C356B]">Benefits</h3>
              </div>
              <div className="space-y-4">
                {currentService.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Target className="w-6 h-6 text-[#1C356B] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1C356B] to-[#87CEEB] rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1C356B]">What You'll Receive</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {currentService.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#87CEEB] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1C356B] font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{deliverable}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Process Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold text-[#1C356B] mb-8 text-center">Our Process</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#87CEEB]" />
                </div>
                <h4 className="font-bold text-[#1C356B] mb-2">1. Assessment</h4>
                <p className="text-gray-600 text-sm">We analyze your current situation and identify key improvement areas</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#87CEEB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#1C356B]" />
                </div>
                <h4 className="font-bold text-[#1C356B] mb-2">2. Planning</h4>
                <p className="text-gray-600 text-sm">We develop customized strategies and implementation plans</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#87CEEB]" />
                </div>
                <h4 className="font-bold text-[#1C356B] mb-2">3. Execution</h4>
                <p className="text-gray-600 text-sm">We implement solutions with your team through hands-on collaboration</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#87CEEB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-[#1C356B]" />
                </div>
                <h4 className="font-bold text-[#1C356B] mb-2">4. Optimization</h4>
                <p className="text-gray-600 text-sm">We monitor results and optimize for continuous improvement</p>
              </div>

            </div>
          </div>

          {/* Call to Action */}
          <div
            className="rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 mt-8 text-white text-center"
            style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Transform your procurement capabilities with our expert {currentService.title.toLowerCase()} services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform shadow-lg"
                style={{ backgroundColor: '#87CEEB' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6ae1f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#87CEEB'}
              >
                Request Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-white hover:text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform"
                style={{ borderColor: '#87CEEB', backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#87CEEB';
                  e.currentTarget.style.color = '#1C356B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }}
              >
                Download Brochure
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Related Services */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-[#1C356B] text-center mb-12">
            Explore Our Other Services
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services
              .filter((_, index) => index !== selectedService)
              .slice(0, 3)
              .map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
                >
                  <div className="w-12 h-12 bg-[#87CEEB] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6 text-[#1C356B]" />
                  </div>
                  <h4 className="font-bold text-[#1C356B] mb-2 group-hover:text-[#87CEEB] transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.shortDescription}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
}