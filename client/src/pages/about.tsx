import { useState } from "react";
import {
  CheckCircle,
  Users,
  Globe,
  Award,
  Target,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  Shield,
  Heart,
  Lightbulb,
  Building,
  Star,
  Handshake,
  ListChecks,
  BookOpen,
  Activity,
  ArrowRight,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  const [activeTab, setActiveTab] = useState("story");

  const coreValues = [
    {
      icon: Shield,
      title: "Dependability",
      description:
        "Consistent delivery of high-quality services you can count on.",
    },
    {
      icon: Heart,
      title: "Integrity",
      description:
        "Honest, ethical practices in all our business relationships.",
    },
    {
      icon: CheckCircle,
      title: "Confidentiality",
      description:
        "Protecting sensitive information with the highest security standards.",
    },
    {
      icon: Target,
      title: "Accountability",
      description:
        "Taking responsibility for our commitments and delivering results.",
    },
    {
      icon: Award,
      title: "Professionalism",
      description:
        "Maintaining excellence in every aspect of our service delivery.",
    },
    {
      icon: Globe,
      title: "Transparency",
      description:
        "Open communication and clear processes in all our engagements.",
    },
    {
      icon: Handshake,
      title: "Fairness",
      description: "Ensuring equity and impartiality in all our interactions.",
    },
  ];

const teamMembers = [
  {
    name: "Mr. Joseph Kalaluka",
    position: "Director – Procurement & Supply / Vice Chairperson – Southern Africa Region",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757283264/WhatsApp_Image_2025-09-04_at_19.03.20_l35bu5.jpg",
    bio: "Mr. Joseph Kalaluka is a procurement and supply chain executive with over 22 years of experience in strategic sourcing, logistics, and supply chain management across energy, development, and humanitarian sectors. He is Director of Procurement and Supply at a major Solar Energy Corporation and Vice Chairperson of Alliance Procurement and Capacity Building Ltd. He is skilled in SCM training, contract negotiation, risk mitigation, and cost-saving strategies. Previously, he held senior positions with the Road Transport & Safety Agency, Oxfam GB, Catholic Relief Services, and CARITAS Zambia. He holds an MSc in Procurement and Logistics, is a PhD candidate in Logistics and Supply Chain Management, and is certified with CIPS (UK), ZIPS, CILT (UK), and ZCILT.",
    expertise: [
      "Strategic Sourcing",
      "Logistics Operations",
      "SCM Training",
      "Contract Negotiation",
      "Risk Mitigation",
      "Cost-saving Strategies",
      "Vendor Relations"
    ],
  },
  {
    name: "Consultant Kelvin M. Nsemu",
    position: "Chairperson – Southern Africa Region",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/e_background_removal/v1756973662/WhatsApp_Image_2025-09-02_at_12.45.31_kweji1.jpg",
    bio: "Consultant Kelvin M. Nsemu is Chairperson of Alliance Procurement and Capacity Building Ltd and Foundation, with 15 years of experience in procurement and supply chain management. He holds advanced degrees in Procurement, Logistics, Political Science, and Materials Administration. He is recognized as a leading consultancy trainer in Zambia with expertise in capacity building, financial management, and public sector reforms, and has a proven track record of implementing strategic initiatives, leading teams, and fostering operational efficiency.",
    expertise: [
      "Strategic Sourcing",
      "Negotiation",
      "Supplier Relationship Management",
      "Regulatory Compliance",
      "Leadership and Coaching",
      "Business Transformation",
    ],
  },
  {
    name: "Lotson M.K. Buumba",
    position: "Training Specialist",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756973993/WhatsApp_Image_2025-09-02_at_12.45.56_zkbshw.jpg",
    bio: "Lotson M.K. Buumba is a training specialist with 16 years of experience in research, planning, monitoring, and evaluation. He holds a Master of Arts in Human Resource Management, a Bachelor of Business Administration, and a Primary Teacher’s Diploma. He is recognized for strong interpersonal and leadership skills, a proactive mindset, and ability to deliver results. He has experience in designing and implementing training programs, mentoring teams, and improving organizational performance across multiple sectors.",
    expertise: [
      "Training & Capacity Building",
      "Monitoring and Evaluation",
      "Human Resource Management",
      "Planning and Research",
      "Leadership Development",
    ],
  },
  {
    name: "Siphiwe Mabhena",
    position: "Director – Secretarial Services (Southern Region)",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.46.41_ymeqvm.jpg",
    bio: "Siphiwe Mabhena is Director of Secretarial Services – Southern Region at Alliance Procurement and Capacity Building Ltd. She holds a Master’s and a Bachelor’s in Public Administration and a Diploma in International Travel & Tourism. She is dedicated to continuous learning, professional growth, and building strong networks. She has a record of enhancing administrative processes, coordinating projects, mentoring staff, and promoting efficiency, transparency, and accountability within secretarial and governance functions.",
    expertise: [
      "Public Administration",
      "Organizational Development",
      "Secretarial & Governance Support",
      "Networking & Relationship Building",
    ],
  },
  {
    name: "Ms. Chomba Chileshe",
    position: "Manager – Consultancy Services",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.48.51_tfmqm9.jpg",
    bio: "Ms. Chomba Chileshe is a procurement and supply chain consultant with over 12 years of experience in procurement planning, contract management, and supply chain coordination. She holds a BSc in Purchasing & Supply Management and is pursuing an MBA in Strategic Management. A full member of ZIPS, she is recognized for integrity, stakeholder engagement, and ability to enhance efficiency and accountability. She has experience designing procurement strategies, optimizing inventory, supervising performance, and providing consultancy services that improve organizational capacity.",
    expertise: [
      "Procurement Strategy",
      "Contract Management",
      "Inventory Management",
      "Performance Supervision",
      "Stakeholder Engagement",
    ],
  },
  {
    name: "Dr. Joseph Selisho",
    position: "Director – Corporate Affairs (Southern Africa Region)",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974009/WhatsApp_Image_2025-09-02_at_12.51.05_wswnjq.jpg",
    bio: "Dr. Joseph Selisho, APCB Ltd’s first training specialist in 2023, was appointed Director of Corporate Affairs in 2024. He oversees corporate strategy, capacity building, training, research, and consultancy initiatives. He was a key driver of the first International Indaba in Procurement, Supply Chain, and Financial Management, advancing regional integration. He is recognized for implementing strategic initiatives, mentoring staff, promoting best practices, and fostering innovation and research in corporate affairs to maintain high standards of professionalism, efficiency, and sustainable growth.",
    expertise: [
      "Corporate Strategy",
      "Capacity Development",
      "Training & Research",
      "Consultancy Services",
      "Regional Integration",
    ],
  },
  {
    name: "Rabby Kazwala Sikozi",
    position: "IT Specialist",
    image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757435266/WhatsApp_Image_2025-09-09_at_09.54.35_lh8mls.jpg",
    bio: "Rabby Kazwala Sikozi is an IT specialist with expertise in disaster recovery, cybersecurity awareness, and digital systems development. He has developed comprehensive ICT disaster recovery manuals and incident management procedures tailored for government, private, and NGO sectors.",
    expertise: [
      "Disaster Recovery",
      "Cybersecurity Awareness",
      "Digital Systems Development",
      "Incident Management",
    ],
    contact: [
      "+260963530936",
      "+260973595988",
    ],
  },

];


  const journey = {
    past: {
      title: "Our Journey So Far",
      description:
        "Since our inception in 2022, we have been dedicated to enhancing technical competencies in procurement and supply chain management. We have successfully conducted numerous training workshops across Zambia, training over 20,000 delegates and supplementing the government's efforts to improve service delivery.",
      stats: [
        { number: "20,000+", label: "Delegates Trained", icon: Users },
        { number: "50+", label: "Organizations Served", icon: Building },
        { number: "15+", label: "Countries Reached", icon: Globe },
        { number: "98%", label: "Client Satisfaction", icon: Star },
      ],
      keyClients: {
        government: [
          "Ministry of Health",
          "Ministry of Finance",
          "Ministry of Education",
          "Zambia Army",
        ],
        parastatal: [
          "ZESCO Limited",
          "National Assembly of Zambia",
          "Bank of Zambia",
          "Zambia Revenue Authority",
        ],
      },
    },
    future: {
      title: "Our Roadmap for 2025",
      description:
        "Our 2025 roadmap is packed with targeted training programs, strategic partnerships, and a landmark international event designed to elevate procurement and supply chain standards across the region.",
      indaba: {
        title:
          "National/International Procurement, Supply Chain & Financial Management Indaba",
        theme:
          "Upholding Procurement Practices to Enhance Procurement and Supply Chain Management, Operations and Financial Management in Zambia through Promotion of Regional Integration, Bringing Development to the Citizenry",
        date: "October 16th to 18th, 2025",
        location: "AVANI Victoria Falls Resort, Livingstone, Zambia",
        guest:
          "Mr. Hakainde Hichilema, The President of the Republic of Zambia",
      },
      roadmap: [
        {
          date: "Jan-Feb",
          title: "Compliance Assessment",
          audience: "Institutions trained by APCBL",
        },
        {
          date: "March",
          title: "Project Implementation & Contract Management",
          audience: "Planners, Quantity Surveyors, Architects",
        },
        {
          date: "April",
          title: "M&E of Constituency Development Funds",
          audience: "CDF Chairpersons, Planners, Engineers",
        },
        {
          date: "May",
          title: "Digital Records Management",
          audience: "Registry, HR, Finance",
        },
        {
          date: "June",
          title: "Operations and Change Management",
          audience: "HR Officers, Planners, Admin Officers",
        },
        {
          date: "August",
          title: "In-house Training for KCM & MOPANI",
          audience: "KCM & MOPANI Management",
        },
        {
          date: "October",
          title: "National Procurement Supply Chain Indaba",
          audience: "Cross-cutting Stakeholders",
        },
        {
          date: "November",
          title: "International Training Workshop",
          audience: "Eswatini Practitioners & Stakeholders",
        },
      ],
    },
  };

  const expertise = {
    strategicObjectives: [
      "Enhance Capacity Development in Procurement, Supply Chain, and Financial Management.",
      "Provide top-tier Consultancy and Training Services to Public and Private Sectors.",
      "Conduct comprehensive Procurement Forensic Audits, Monitoring, and Evaluations.",
      "Undertake Global Supply Chain Assessments to identify trends and risks.",
      "Strengthen planning, contract management, and supply chain risk mitigation.",
    ],
    competencies: [
      "Procurement & Supply Chain Capacity Building",
      "In-house Training Development",
      "Compliance Assessment & Procurement Audits",
      "Recruitment of Procurement Professionals",
      "Procurement Process Planning & Implementation",
      "Drafting of Supply Chain Contracts",
      "Mediation in Procurement Dialogue",
      "Tender Evaluation & Selection",
      "Clarifying Complex Supply Chain Questions",
      "Advising on Post-Tender Negotiations",
      "Standby Think-Tank for African Organisations",
      "Facilitating Best Practice Awards",
      "Leading Research in Supply Chain Management",
      "Training in International Trade Policy & Law",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C356B] via-[#2d4a7a] to-[#0f1e3d] text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2210%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2250%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#87CEEB]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 px-4 py-20 sm:py-24 lg:py-32">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              <Badge
                variant="secondary"
                className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Who We Are
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-[#87CEEB] bg-clip-text text-transparent leading-tight">
                About Alliance
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 leading-relaxed mb-8 max-w-4xl mx-auto">
                Transforming procurement capabilities across Africa through
                expert training, advisory services, and innovative solutions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-[#87CEEB] hover:bg-[#87CEEB]/90 text-[#1C356B] font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Discover Our Story
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full backdrop-blur-sm"
                >
                  View Our Impact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <div className="-mt-12 sm:-mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {journey.past.stats.map((stat, i) => (
              <Card
                key={i}
                className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#87CEEB] to-[#f1b000] flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-7 h-7 text-[#1C356B]" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-[#1C356B] dark:text-white leading-none mb-1">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center overflow-x-auto scrollbar-hide">
            {[
              { id: "story", label: "Our Story", icon: BookOpen },
              { id: "values", label: "Our Values", icon: Heart },
              { id: "expertise", label: "Our Expertise", icon: ListChecks },
              { id: "journey", label: "Our Journey", icon: TrendingUp },
              { id: "team", label: "Our Team", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-3 px-6 py-5 border-b-3 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#87CEEB] text-[#1C356B] dark:text-[#87CEEB] bg-[#87CEEB]/5"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-[#1C356B] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div
                  className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-105"}`}
                >
                  <tab.icon className="w-full h-full" />
                </div>
                <span className="font-semibold text-sm sm:text-base">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Our Story */}
        {activeTab === "story" && (
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center mb-12">
              <Badge
                variant="outline"
                className="mb-4 border-[#87CEEB] text-[#1C356B]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Our Foundation
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C356B] dark:text-white mb-6">
                Who Is <span className="text-[#87CEEB]">Alliance</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700 border-0 shadow-xl">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Alliance Procurement and Capacity Building Limited (APCBL)
                    is a Zambian-owned private company established and
                    registered under the Patents and Companies Registration
                    Agency (PACRA) on 16th November, 2022. Our main objective is
                    to enhance practitioners' and stakeholders' procurement and
                    supply chain management technical skills, competencies,
                    knowledge and capabilities to supplement the Government's
                    effort in improving service delivery in the public and
                    private sectors through training workshops and capacity
                    development.
                  </p>
                </Card>

                <Card className="p-8 bg-gradient-to-br from-[#87CEEB]/10 to-yellow-50 dark:from-yellow-900/20 dark:to-gray-800 border-l-4 border-[#87CEEB] shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#87CEEB] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-[#1C356B]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1C356B] dark:text-white mb-4">
                        Our Vision
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        To be a leading training, research and consultancy
                        company for public and private sector Supply Chain
                        Systems and Financial Management in the Southern Africa
                        Region and beyond. This can only be achieved with the
                        full commitment, involvement, and proficient support of
                        the Government of the Republic of Zambia (GRZ) and
                        cooperating partners.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-gradient-to-br from-[#1C356B]/5 to-blue-50 dark:from-blue-900/20 dark:to-gray-800 border-l-4 border-[#1C356B] shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1C356B] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1C356B] dark:text-white mb-4">
                        Our Mission
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        To be a knowledge bank on Capacity Development, Capacity
                        Building, In-house training and consultancy services. We
                        engage the most qualified experts to enhance
                        competencies in Procurement, Financial Management, and
                        more, while actively participating in formulating best
                        practices to ensure cost reduction, quality, and timely
                        delivery.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-r from-[#87CEEB]/20 to-[#1C356B]/20 rounded-3xl blur-3xl transform rotate-6"></div>
                <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-2xl">
                  <img
                    src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg"
                    alt="Team collaborating in a modern office"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <Card className="p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#87CEEB] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-7 h-7 text-[#1C356B]" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[#1C356B] dark:text-white">
                            Established
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            November 16, 2022
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Our Values */}
        {activeTab === "values" && (
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center">
              <Badge
                variant="outline"
                className="mb-4 border-[#87CEEB] text-[#1C356B]"
              >
                <Heart className="w-4 h-4 mr-2" />
                Our Foundation
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C356B] dark:text-white mb-6">
                Our Core <span className="text-[#87CEEB]">Values</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Our values are the bedrock of our identity. They guide every
                decision, every interaction, and every service we deliver,
                ensuring we operate with unwavering integrity and a commitment
                to excellence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {coreValues.map((value, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#87CEEB]/5 to-[#1C356B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="relative p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#87CEEB] to-[#f1b000] rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="w-8 h-8 text-[#1C356B]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C356B] dark:text-white mb-4 group-hover:text-[#87CEEB] transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#87CEEB] to-[#1C356B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Our Expertise */}
        {activeTab === "expertise" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Our Expertise
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We are a full-service Procurement and Supply Chain solutions
                organization, offering a wide range of services to meet the
                evolving needs of our clients.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary-blue dark:text-white">
                    <Target className="w-6 h-6 mr-3 text-primary-yellow" />
                    Our Strategic Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {expertise.strategicObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary-yellow flex-shrink-0 mt-1" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {obj}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary-blue dark:text-white">
                    <ListChecks className="w-6 h-6 mr-3 text-primary-yellow" />
                    Our Competencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {expertise.competencies.map((comp, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-primary-blue/10 text-primary-blue dark:text-white dark:bg-primary-blue/20 rounded-full text-sm font-medium"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Our Journey */}
        {activeTab === "journey" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Our Journey & Future Roadmap
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                From our inception to our ambitious plans for the future, our
                journey is one of continuous growth, impact, and a relentless
                drive for excellence in the procurement and supply chain sector.
              </p>
            </div>

            {/* Past Section */}
            <Card className="mb-16 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 lg:p-12">
                  <h3 className="text-2xl font-bold text-primary-blue dark:text-white mb-4">
                    {journey.past.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {journey.past.description}
                  </p>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Key institutions we've empowered:
                  </h4>
                  <div className="flex space-x-8">
                    <div>
                      <h5 className="font-bold text-primary-blue dark:text-white">
                        Government
                      </h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {journey.past.keyClients.government.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-primary-blue dark:text-white">
                        Parastatal & Private
                      </h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {journey.past.keyClients.parastatal.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-8 bg-primary-blue/5 dark:bg-primary-blue/10">
                  {journey.past.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                    >
                      <stat.icon className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary-blue dark:text-white">
                        {stat.number}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Future Section */}
            <div>
              <h3 className="text-2xl font-bold text-primary-blue dark:text-white text-center mb-8">
                {journey.future.title}
              </h3>

              <div className="bg-primary-yellow/10 dark:bg-primary-yellow/20 border-l-4 border-primary-yellow text-primary-blue dark:text-gray-200 p-6 rounded-r-lg mb-12 shadow-lg">
                <h4 className="font-bold text-xl mb-2 flex items-center">
                  <Star className="w-6 h-6 mr-3" />A Momentous Event for 2025
                </h4>
                <p className="font-semibold">{journey.future.indaba.title}</p>
                <p className="text-sm italic my-2">
                  "{journey.future.indaba.theme}"
                </p>
                <p className="text-sm">
                  <span className="font-bold">Date:</span>{" "}
                  {journey.future.indaba.date}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Location:</span>{" "}
                  {journey.future.indaba.location}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Guest of Honour:</span>{" "}
                  {journey.future.indaba.guest}
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-5 top-0 w-0.5 h-full bg-primary-yellow/50"></div>
                <div className="space-y-8">
                  {journey.future.roadmap.map((item, index) => (
                    <div key={index} className="flex items-center space-x-6">
                      <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex-shrink-0 flex items-center justify-center font-bold z-10 ring-4 ring-white dark:ring-gray-900">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-1">
                        <p className="font-bold text-primary-blue dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.audience}
                        </p>
                        <p className="text-xs font-semibold text-primary-yellow mt-1">
                          {item.date}, 2025
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Team */}
        {activeTab === "team" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Meet Our Expert Team
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Behind our leadership is a highly skilled and dedicated team of
                trainers, researchers, consultants, and technical professionals,
                turning strategic vision into measurable results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <Card
                  key={index}
                  className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-yellow/20"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1C356B&color=FDC123&size=150`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-blue dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-primary-yellow font-medium mb-3">
                          {member.position}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                          {member.bio}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-primary-blue/10 text-primary-blue dark:text-white dark:bg-primary-blue/20 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-blue dark:text-white mb-6">
              Ready to Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Let's discuss how APCBL can help transform your procurement
              capabilities and drive organizational success.
            </p>
            <Button
              size="lg"
              className="bg-primary-yellow text-primary-blue transition-all duration-300 font-semibold hover:scale-105 transform shadow-lg hover:bg-yellow-400"
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
