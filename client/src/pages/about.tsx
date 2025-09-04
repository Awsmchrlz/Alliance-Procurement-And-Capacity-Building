
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  const [activeTab, setActiveTab] = useState('story');

  const coreValues = [
    { icon: Shield, title: "Dependability", description: "Consistent delivery of high-quality services you can count on." },
    { icon: Heart, title: "Integrity", description: "Honest, ethical practices in all our business relationships." },
    { icon: CheckCircle, title: "Confidentiality", description: "Protecting sensitive information with the highest security standards." },
    { icon: Target, title: "Accountability", description: "Taking responsibility for our commitments and delivering results." },
    { icon: Award, title: "Professionalism", description: "Maintaining excellence in every aspect of our service delivery." },
    { icon: Globe, title: "Transparency", description: "Open communication and clear processes in all our engagements." },
    { icon: Handshake, title: "Fairness", description: "Ensuring equity and impartiality in all our interactions." }
  ];

  const teamMembers = [
   {
     name: "Consultant Kelvin M. Nsemu",
     position: "Chairperson – Southern Africa Region",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/e_background_removal/v1756973662/WhatsApp_Image_2025-09-02_at_12.45.31_kweji1.jpg",
     bio: "Chairperson of Alliance Procurement and Capacity Building Ltd and Foundation. With 15 years of procurement and supply chain experience, he holds multiple advanced degrees in Procurement, Logistics, Political Science, and Materials Administration. He is recognized as a leading private sector consultancy training provider in Zambia, with deep expertise in capacity building, public sector reforms, and financial management.",
     expertise: ["Strategic Sourcing", "Negotiation", "Supplier Relationship Management", "Regulatory Compliance", "Leadership and Coaching", "Business Transformation"]
   },
   {
     name: "Lotson M.K. Buumba",
     position: "Training Specialist",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756973993/WhatsApp_Image_2025-09-02_at_12.45.56_zkbshw.jpg",
     bio: "Training specialist with 16 years of experience in research, planning, monitoring, and evaluation. Holds a Master of Arts in Human Resource Management, Bachelor of Business Administration, and a Primary Teacher’s Diploma. Recognized for strong interpersonal and leadership skills, proactive mindset, and ability to deliver under pressure.",
     expertise: ["Training & Capacity Building", "Monitoring and Evaluation", "Human Resource Management", "Planning and Research", "Leadership Development"]
   },
   {
     name: "Siphiwe Mabhena",
     position: "Director – Secretarial Services (Southern Region)",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.46.41_ymeqvm.jpg",
     bio: "Director of Secretarial Services – Southern Region at Alliance Procurement and Capacity Building Ltd. Holds a Master’s in Public Administration, a Bachelor’s in Public Administration, and a Diploma in International Travel & Tourism. Passionate about continuous learning, personal growth, and building strong professional networks.",
     expertise: ["Public Administration", "Organizational Development", "Secretarial & Governance Support", "Networking & Relationship Building"]
   },
   {
     name: "Ms. Chomba Chileshe",
     position: "Manager – Consultancy Services",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974008/WhatsApp_Image_2025-09-02_at_12.48.51_tfmqm9.jpg",
     bio: "Procurement and supply chain consultant with 12+ years of experience in procurement planning, contract management, and supply chain coordination. Holds a BSc in Purchasing & Supply Management and is pursuing an MBA in Strategic Management. A full member of the Zambia Institute of Purchasing and Supply (ZIPS). Known for her integrity, stakeholder engagement, and ability to drive efficiency and accountability.",
     expertise: ["Procurement Strategy", "Contract Management", "Inventory Management", "Performance Supervision", "Stakeholder Engagement"]
   },
   {
     name: "Dr. Joseph Selisho",
     position: "Director – Corporate Affairs (Southern Africa Region)",
     image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1756974009/WhatsApp_Image_2025-09-02_at_12.51.05_wswnjq.jpg",
     bio: "APCB Ltd’s first training specialist in 2023 and appointed Director of Corporate Affairs in 2024. Oversees corporate strategy development in capacity building, training, research, and consultancy. Key driver behind the first International Indaba in Procurement, Supply Chain, and Financial Management, advancing regional integration across Africa.",
     expertise: ["Corporate Strategy", "Capacity Development", "Training & Research", "Consultancy Services", "Regional Integration"]
   }
 ];

  const journey = {
    past: {
      title: "Our Journey So Far",
      description: "Since our inception in 2022, we have been dedicated to enhancing technical competencies in procurement and supply chain management. We have successfully conducted numerous training workshops across Zambia, training over 20,000 delegates and supplementing the government's efforts to improve service delivery.",
      stats: [
        { number: "20,000+", label: "Delegates Trained", icon: Users },
        { number: "50+", label: "Organizations Served", icon: Building },
        { number: "15+", label: "Countries Reached", icon: Globe },
        { number: "98%", label: "Client Satisfaction", icon: Star }
      ],
      keyClients: {
        government: ["Ministry of Health", "Ministry of Finance", "Ministry of Education", "Zambia Army"],
        parastatal: ["ZESCO Limited", "National Assembly of Zambia", "Bank of Zambia", "Zambia Revenue Authority"]
      }
    },
    future: {
      title: "Our Roadmap for 2025",
      description: "Our 2025 roadmap is packed with targeted training programs, strategic partnerships, and a landmark international event designed to elevate procurement and supply chain standards across the region.",
      indaba: {
        title: "National/International Procurement, Supply Chain & Financial Management Indaba",
        theme: "Upholding Procurement Practices to Enhance Procurement and Supply Chain Management, Operations and Financial Management in Zambia through Promotion of Regional Integration, Bringing Development to the Citizenry",
        date: "October 16th to 18th, 2025",
        location: "AVANI Victoria Falls Resort, Livingstone, Zambia",
        guest: "Mr. Hakainde Hichilema, The President of the Republic of Zambia"
      },
      roadmap: [
        { date: "Jan-Feb", title: "Compliance Assessment", audience: "Institutions trained by APCBL" },
        { date: "March", title: "Project Implementation & Contract Management", audience: "Planners, Quantity Surveyors, Architects" },
        { date: "April", title: "M&E of Constituency Development Funds", audience: "CDF Chairpersons, Planners, Engineers" },
        { date: "May", title: "Digital Records Management", audience: "Registry, HR, Finance" },
        { date: "June", title: "Operations and Change Management", audience: "HR Officers, Planners, Admin Officers" },
        { date: "August", title: "In-house Training for KCM & MOPANI", audience: "KCM & MOPANI Management" },
        { date: "October", title: "National Procurement Supply Chain Indaba", audience: "Cross-cutting Stakeholders" },
        { date: "November", title: "International Training Workshop", audience: "Eswatini Practitioners & Stakeholders" },
      ]
    }
  };

  const expertise = {
    strategicObjectives: [
      "Enhance Capacity Development in Procurement, Supply Chain, and Financial Management.",
      "Provide top-tier Consultancy and Training Services to Public and Private Sectors.",
      "Conduct comprehensive Procurement Forensic Audits, Monitoring, and Evaluations.",
      "Undertake Global Supply Chain Assessments to identify trends and risks.",
      "Strengthen planning, contract management, and supply chain risk mitigation."
    ],
    competencies: [
      "Procurement & Supply Chain Capacity Building", "In-house Training Development", "Compliance Assessment & Procurement Audits",
      "Recruitment of Procurement Professionals", "Procurement Process Planning & Implementation", "Drafting of Supply Chain Contracts",
      "Mediation in Procurement Dialogue", "Tender Evaluation & Selection", "Clarifying Complex Supply Chain Questions",
      "Advising on Post-Tender Negotiations", "Standby Think-Tank for African Organisations", "Facilitating Best Practice Awards",
      "Leading Research in Supply Chain Management", "Training in International Trade Policy & Law"
    ]
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

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
              Transforming procurement capabilities across Africa through expert training, advisory services, and innovative solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center overflow-x-auto scrollbar-hide">
            {[
              { id: 'story', label: 'Our Story', icon: BookOpen },
              { id: 'values', label: 'Our Values', icon: Heart },
              { id: 'expertise', label: 'Our Expertise', icon: ListChecks },
              { id: 'journey', label: 'Our Journey', icon: TrendingUp },
              { id: 'team', label: 'Our Team', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-yellow text-primary-blue dark:text-primary-yellow bg-primary-yellow/5'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
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
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="flex flex-col space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white">
                  Who Is Alliance
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Alliance Procurement and Capacity Building Limited (APCBL) is a Zambian-owned private company established and registered under the Patents and Companies Registration Agency (PACRA) on 16th November, 2022. Our main objective is to enhance practitioners' and stakeholders' procurement and supply chain management technical skills, competencies, knowledge and capabilities to supplement the Government’s effort in improving service delivery in the public and private sectors through training workshops and capacity development.
                </p>

                <div className="bg-primary-yellow/10 dark:bg-primary-yellow/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-primary-blue dark:text-white mb-4 flex items-center">
                    <Lightbulb className="w-6 h-6 mr-3 text-primary-yellow" />
                    Our Vision
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To be a leading training, research and consultancy company for public and private sector Supply Chain Systems and Financial Management in the Southern Africa Region and beyond. This can only be achieved with the full commitment, involvement, and proficient support of the Government of the Republic of Zambia (GRZ) and cooperating partners.
                  </p>
                </div>

                <div className="bg-primary-blue/5 dark:bg-primary-blue/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-primary-blue dark:text-white mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-primary-yellow" />
                    Our Mission
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To be a knowledge bank on Capacity Development, Capacity Building, In-house training and consultancy services. We engage the most qualified experts to enhance competencies in Procurement, Financial Management, and more, while actively participating in formulating best practices to ensure cost reduction, quality, and timely delivery.
                  </p>
                </div>
              </div>

              <div className="relative mt-10 md:mt-0">
                <img
                  src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg"
                  alt="Team collaborating in a modern office"
                  className="rounded-2xl shadow-xl w-full"
                />
                <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary-blue" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-blue dark:text-white">Established</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">November 2022</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Values */}
        {activeTab === 'values' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our values are the bedrock of our identity. They guide every decision, every interaction, and every service we deliver, ensuring we operate with unwavering integrity and a commitment to excellence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-primary-yellow rounded-2xl flex items-center justify-center mb-6">
                    <value.icon className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-blue dark:text-white mb-4">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Our Expertise */}
        {activeTab === 'expertise' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Our Expertise
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We are a full-service Procurement and Supply Chain solutions organization, offering a wide range of services to meet the evolving needs of our clients.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary-blue dark:text-white">
                    <Target className="w-6 h-6 mr-3 text-primary-yellow"/>
                    Our Strategic Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {expertise.strategicObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary-yellow flex-shrink-0 mt-1" />
                        <span className="text-gray-700 dark:text-gray-300">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary-blue dark:text-white">
                    <ListChecks className="w-6 h-6 mr-3 text-primary-yellow"/>
                    Our Competencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {expertise.competencies.map((comp, i) => (
                       <span key={i} className="px-4 py-2 bg-primary-blue/10 text-primary-blue dark:text-white dark:bg-primary-blue/20 rounded-full text-sm font-medium">
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
        {activeTab === 'journey' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Our Journey & Future Roadmap
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                From our inception to our ambitious plans for the future, our journey is one of continuous growth, impact, and a relentless drive for excellence in the procurement and supply chain sector.
              </p>
            </div>

            {/* Past Section */}
            <Card className="mb-16 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 lg:p-12">
                  <h3 className="text-2xl font-bold text-primary-blue dark:text-white mb-4">{journey.past.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{journey.past.description}</p>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Key institutions we've empowered:</h4>
                  <div className="flex space-x-8">
                    <div>
                      <h5 className="font-bold text-primary-blue dark:text-white">Government</h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {journey.past.keyClients.government.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-primary-blue dark:text-white">Parastatal & Private</h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {journey.past.keyClients.parastatal.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-8 bg-primary-blue/5 dark:bg-primary-blue/10">
                  {journey.past.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <stat.icon className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary-blue dark:text-white">{stat.number}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Future Section */}
            <div>
              <h3 className="text-2xl font-bold text-primary-blue dark:text-white text-center mb-8">{journey.future.title}</h3>
              
              <div className="bg-primary-yellow/10 dark:bg-primary-yellow/20 border-l-4 border-primary-yellow text-primary-blue dark:text-gray-200 p-6 rounded-r-lg mb-12 shadow-lg">
                <h4 className="font-bold text-xl mb-2 flex items-center"><Star className="w-6 h-6 mr-3"/>A Momentous Event for 2025</h4>
                <p className="font-semibold">{journey.future.indaba.title}</p>
                <p className="text-sm italic my-2">"{journey.future.indaba.theme}"</p>
                <p className="text-sm"><span className="font-bold">Date:</span> {journey.future.indaba.date}</p>
                <p className="text-sm"><span className="font-bold">Location:</span> {journey.future.indaba.location}</p>
                <p className="text-sm"><span className="font-bold">Guest of Honour:</span> {journey.future.indaba.guest}</p>
              </div>

              <div className="relative">
                <div className="absolute left-5 top-0 w-0.5 h-full bg-primary-yellow/50"></div>
                <div className="space-y-8">
                  {journey.future.roadmap.map((item, index) => (
                    <div key={index} className="flex items-center space-x-6">
                      <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex-shrink-0 flex items-center justify-center font-bold z-10 ring-4 ring-white dark:ring-gray-900">
                        <Activity className="w-5 h-5"/>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-1">
                        <p className="font-bold text-primary-blue dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.audience}</p>
                        <p className="text-xs font-semibold text-primary-yellow mt-1">{item.date}, 2025</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Team */}
        {activeTab === 'team' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-blue dark:text-white mb-4">
                Meet Our Expert Team
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Behind our leadership is a highly skilled and dedicated team of trainers, researchers, consultants, and technical professionals, turning strategic vision into measurable results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-yellow/20"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1C356B&color=FDC123&size=150`; }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-blue dark:text-white">{member.name}</h3>
                        <p className="text-primary-yellow font-medium mb-3">{member.position}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{member.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-1 bg-primary-blue/10 text-primary-blue dark:text-white dark:bg-primary-blue/20 rounded-full text-xs font-medium">
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
              Let's discuss how APCBL can help transform your procurement capabilities and drive organizational success.
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
