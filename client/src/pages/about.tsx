import { useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  Users,
  Globe,
  Award,
  Target,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  Shield,
  Heart,
  Lightbulb,
  Building,
  Clock,
  Star,
  Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  const [activeTab, setActiveTab] = useState('story');

  const coreValues = [
    {
      icon: Shield,
      title: "Dependability",
      description: "Consistent delivery of high-quality services you can count on"
    },
    {
      icon: Heart,
      title: "Integrity",
      description: "Honest, ethical practices in all our business relationships"
    },
    {
      icon: CheckCircle,
      title: "Confidentiality",
      description: "Protecting sensitive information with the highest security standards"
    },
    {
      icon: Target,
      title: "Accountability",
      description: "Taking responsibility for our commitments and delivering results"
    },
    {
      icon: Award,
      title: "Professionalism",
      description: "Maintaining excellence in every aspect of our service delivery"
    },
    {
      icon: Globe,
      title: "Transparency",
      description: "Open communication and clear processes in all our engagements"
    }
  ];

 const teamMembers = [
   {
     name: "Consultant Kelvin M. Nsemu",
     position: "Chairperson – Southern Africa Region",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/e_background_removal/v1756973662/WhatsApp_Image_2025-09-02_at_12.45.31_kweji1.jpg",
     /*https://res.cloudinary.com/duu5rnmeu/image/upload/v1756973662/WhatsApp_Image_2025-09-02_at_12.45.31_kweji1.jpg*/
     bio: "Chairperson of Alliance Procurement and Capacity Building Ltd and Foundation. With 15 years of procurement and supply chain experience, he holds multiple advanced degrees in Procurement, Logistics, Political Science, and Materials Administration. He is recognized as a leading private sector consultancy training provider in Zambia, with deep expertise in capacity building, public sector reforms, and financial management.",
     expertise: [
       "Strategic Sourcing",
       "Negotiation",
       "Supplier Relationship Management",
       "Regulatory Compliance (ZPPA, World Bank, COMESA)",
       "Leadership and Coaching",
       "Business Transformation",
       "Training & Capacity Development"
     ]
   },
   {
     name: "Lotson M.K. Buumba",
     position: "Training Specialist",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756973993/WhatsApp_Image_2025-09-02_at_12.45.56_zkbshw.jpg",
     bio: "Training specialist with 16 years of experience in research, planning, monitoring, and evaluation. Holds a Master of Arts in Human Resource Management, Bachelor of Business Administration, and a Primary Teacher’s Diploma. Recognized for strong interpersonal and leadership skills, proactive mindset, and ability to deliver under pressure.",
     expertise: [
       "Training & Capacity Building",
       "Monitoring and Evaluation",
       "Human Resource Management",
       "Planning and Research",
       "Leadership Development"
     ]
   },
   {
     name: "Siphiwe Mabhena",
     position: "Director – Secretarial Services (Southern Region)",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.46.41_ymeqvm.jpg",
     bio: "Director of Secretarial Services – Southern Region at Alliance Procurement and Capacity Building Ltd. Holds a Master’s in Public Administration, a Bachelor’s in Public Administration, and a Diploma in International Travel & Tourism. Passionate about continuous learning, personal growth, and building strong professional networks.",
     expertise: [
       "Public Administration",
       "Organizational Development",
       "Secretarial & Governance Support",
       "Networking & Relationship Building"
     ]
   },
   {
     name: "Ms. Chomba Chileshe",
     position: "Manager – Consultancy Services",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.48.51_tfmqm9.jpg",
     bio: "Procurement and supply chain consultant with 12+ years of experience in procurement planning, contract management, and supply chain coordination. Holds a BSc in Purchasing & Supply Management and is pursuing an MBA in Strategic Management. A full member of the Zambia Institute of Purchasing and Supply (ZIPS). Known for her integrity, stakeholder engagement, and ability to drive efficiency and accountability.",
     expertise: [
       "Procurement Strategy",
       "Contract Management",
       "Inventory Management",
       "Performance Supervision",
       "Stakeholder Engagement"
     ]
   },
   {
     name: "Dr. Joseph Selisho",
     position: "Director – Corporate Affairs (Southern Africa Region)",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974009/WhatsApp_Image_2025-09-02_at_12.51.05_wswnjq.jpg",
     bio: "APCB Ltd’s first training specialist in 2023 and appointed Director of Corporate Affairs in 2024. Oversees corporate strategy development in capacity building, training, research, and consultancy. Key driver behind the first International Indaba in Procurement, Supply Chain, and Financial Management, advancing regional integration across Africa.",
     expertise: [
       "Corporate Strategy",
       "Capacity Development",
       "Training & Research",
       "Consultancy Services",
       "Regional Integration"
     ]
   }
 ];


  const milestones = [
    {
      year: "2022",
      title: "Company Established",
      description: "APCB Ltd was officially registered under PACRA on November 16th",
      icon: Building
    },
    {
      year: "2023",
      title: "First Major Contracts",
      description: "Secured partnerships with leading organizations across Zambia",
      icon: Handshake
    },
    {
      year: "2024",
      title: "Regional Expansion",
      description: "Extended services across Southern Africa with successful projects",
      icon: Globe
    },
    {
      year: "2025",
      title: "Excellence Recognition",
      description: "Achieved industry recognition for outstanding service delivery",
      icon: Award
    }
  ];

  const stats = [
    { number: "500+", label: "Professionals Trained", icon: Users },
    { number: "50+", label: "Organizations Served", icon: Building },
    { number: "15+", label: "Countries Reached", icon: Globe },
    { number: "98%", label: "Client Satisfaction", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section
        className="text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About <span style={{ color: '#FDC123' }}>Alliance</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed">
              Transforming procurement capabilities across Africa through expert training, advisory services, and innovative solutions
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
<div className="bg-white shadow-sm border-b sticky top-0 z-40">
  <div className="container mx-auto px-4">
    <div className="flex justify-center overflow-x-auto scrollbar-hide">
      {[
        { id: 'story', label: 'Our Story', icon: Building },
        { id: 'values', label: 'Values & Mission', icon: Heart },
        { id: 'team', label: 'Our Team', icon: Users },
        { id: 'journey', label: 'Our Journey', icon: TrendingUp }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
            activeTab === tab.id
              ? 'border-[#FDC123] text-[#1C356B] bg-[#FDC123]/5'
              : 'border-transparent text-gray-600 hover:text-[#1C356B] hover:bg-gray-50'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  </div>
</div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 lg:py-16">

        {/* Our Story */}
        {activeTab === 'story' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1C356B] mb-6">
                  Who Is Alliance
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Alliance Procurement and Capacity Building Limited (APCB Ltd) is a proudly Zambian-owned private company established and registered under the Patents and Companies Registration Agency (PACRA) on 16th November, 2022.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our main objective is to enhance practitioners' and stakeholders' technical skills, competencies, knowledge and capabilities in procurement and supply chain management. We work to supplement the Government's efforts in improving service delivery across both public and private sectors through comprehensive training workshops and capacity building programs.
                </p>

                <div className="bg-[#FDC123]/10 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-[#1C356B] mb-4 flex items-center">
                    <Lightbulb className="w-6 h-6 mr-3 text-[#FDC123]" />
                    Our Vision
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To be a leading training, research and consultancy company for public and private sector
                    Supply Chain Systems and Financial Management in the Southern Africa Region and beyond .This can
                    only be achieved with the full commitment, involvement, and proficient support of the Government of
                    the Republic of Zambia (GRZ) and cooperating partners.
                  </p>
                </div>

                <div className="bg-[#1C356B]/5 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#1C356B] mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-[#FDC123]" />
                    Our Mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                   To be a knowledge bank on Capacity Development, Capacity Building, In-house Training, and Consultancy Services by engaging top experts in procurement, supply chain management, financial management, compliance, audits, and research. Alliance Procurement and Capacity Building Limited also contributes to developing effective regulations and procedures that ensure cost reduction, quality, and timely delivery of goods, works, and services.
                  </p>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80"
                  alt="Modern office environment with professionals collaborating"
                  className="rounded-2xl shadow-xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-xl max-w-xs">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#FDC123] rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#1C356B]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1C356B]">Established</p>
                      <p className="text-gray-600">November 2022</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-[#FDC123]" />
                  </div>
                  <div className="text-3xl font-bold text-[#1C356B] mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values & Mission */}
        {activeTab === 'values' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C356B] mb-4">
                Our Values & Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our core values guide every decision we make and every service we deliver, ensuring consistent excellence and ethical practices.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {coreValues.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-[#FDC123] rounded-2xl flex items-center justify-center mb-6">
                    <value.icon className="w-8 h-8 text-[#1C356B]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1C356B] mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Impact Areas */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-[#1C356B] mb-8 text-center">Our Impact Areas</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-[#1C356B] flex items-center">
                    <Building className="w-6 h-6 mr-3 text-[#FDC123]" />
                    Public Sector
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Government procurement reform initiatives</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Public sector capacity building programs</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Compliance and audit support services</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Policy development and implementation</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-[#1C356B] flex items-center">
                    <Briefcase className="w-6 h-6 mr-3 text-[#FDC123]" />
                    Private Sector
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Corporate procurement optimization</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Supply chain digitalization support</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Cost reduction and efficiency programs</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#FDC123] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Supplier relationship management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Team */}
        {activeTab === 'team' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C356B] mb-4">
                Meet Our Expert Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Behind our leadership is a highly skilled and dedicated team of trainers, researchers, consultants, and technical professionals. Together, we bring a multidisciplinary, collaborative approach that turns strategic vision into measurable results across training, advisory, and research engagements.     </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#FDC123]/20">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1C356B&color=FDC123&size=150`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1C356B] mb-2">{member.name}</h3>
                        <p className="text-[#FDC123] font-medium mb-3">{member.position}</p>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-[#1C356B]/10 text-[#1C356B] rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Choose Our Team */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-[#1C356B] mb-8 text-center">Why Choose Our Team</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-[#FDC123]" />
                  </div>
                  <h4 className="font-bold text-[#1C356B] mb-2">Proven Expertise</h4>
                  <p className="text-gray-600 text-sm">Decades of combined experience in procurement and supply chain management</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FDC123] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-[#1C356B]" />
                  </div>
                  <h4 className="font-bold text-[#1C356B] mb-2">Regional Knowledge</h4>
                  <p className="text-gray-600 text-sm">Deep understanding of African markets and regulatory environments</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-[#FDC123]" />
                  </div>
                  <h4 className="font-bold text-[#1C356B] mb-2">Innovation Focus</h4>
                  <p className="text-gray-600 text-sm">Cutting-edge approaches to traditional procurement challenges</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Journey */}
        {activeTab === 'journey' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C356B] mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    In striving to achieve our vision, APCB ltd embarked on training through seminars and workshops to public and private institution employees in procurement/ Electronic Government Procurement Systems (e-GP) supply chain management, financial management, operations, Stores and logistics management, since its inception.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-[#FDC123] rounded-full"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 bg-[#1C356B] rounded-full flex items-center justify-center ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
                            <milestone.icon className="w-5 h-5 text-[#FDC123]" />
                          </div>
                          <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                            <div className="text-2xl font-bold text-[#FDC123]">{milestone.year}</div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#1C356B] mb-2">{milestone.title}</h3>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <div className="w-4 h-4 bg-[#FDC123] rounded-full border-4 border-white shadow-lg"></div>
                    </div>

                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Vision */}
            <div
              className="rounded-2xl shadow-xl p-8 lg:p-12 mt-16 text-white text-center"
              style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
            >
              <h3 className="text-3xl font-bold mb-6">Looking Forward</h3>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                    To be a leading provider of training, research, and consultancy services for procurement, supply chain systems and processes in the public and private sectors in Zambia, Southern Africa and beyond.
               </p>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#FDC123] mb-2">2025</div>
                  <div className="text-white/80">Regional Hub Launch</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FDC123] mb-2">2026</div>
                  <div className="text-white/80">Digital Platform Launch</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FDC123] mb-2">2027</div>
                  <div className="text-white/80">International Expansion</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#1C356B] mb-6">
              Ready to Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Let's discuss how APCB can help transform your procurement capabilities and drive organizational success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform shadow-lg"
                style={{ backgroundColor: '#FDC123' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6ae1f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDC123'}
              >
                <Phone className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
             
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}