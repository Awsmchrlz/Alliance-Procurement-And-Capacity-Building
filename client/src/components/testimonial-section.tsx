import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Dub Judah Shamayuwa",
      position: "Director of Procurement Officer",
      company: "Evelyn Hone College",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652646/WhatsApp_Image_2025-09-11_at_20.55.20_xa4gnu.jpg",
      rating: 5,
      text: "The workshop provided me with invaluable knowledge in several areas. I learned that matters we often overlook—such as proper record-keeping—can either protect us from audit queries or expose us to significant risks. I also deepened my understanding of emotional and intelligence quotients and their practical application in workplace settings, especially in managerial roles. Equally important, I was able to build a strong professional network by connecting with other procurement professionals."
    },
    {
      id: 2,
      name: "Michael Idah Chilala Hachuka",
      position: "Stores Officer",
      company: "kafue general Hospital",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652647/WhatsApp_Image_2025-09-11_at_21.08.35_ryxo5z.jpg",
      rating: 5,
      text: "Attending the MoH Stores Officers Workshop held from 27th to 29th August 2025 was an eye-opening and enriching experience. The sessions on procurement compliance, records management, and risk mitigation gave me practical insights that I can immediately apply in my daily work. I especially appreciated the discussions on the new amendments to the Public Procurement Act and how they affect stores operations. The interactive panel discussions allowed us to exchange ideas and challenges openly, and I left the workshop feeling more confident, knowledgeable, and empowered to handle my responsibilities effectively."
    },
    {
      id: 3,
      name: "Jackson Sakala",
      position: "Senior Registry Officer",
      company: "Mansa Provincial Administration ",
      rating: 5,
      text: "The Ministry of Education’s for Luapula Province workshop on Electronic Government Procurement held at Samfya Secondary School in Samfya District from 25th to 26th October, 2024, was very enlightening. The sessions provided practical knowledge on e-GP and emphasized the importance of prudent supply chain and operations management in driving sustainable development. I am now better equipped to apply these skills to enhance transparency, accountability, and efficiency in my daily work"
    },
    {
      id: 4,
      name: "Cynthia Maanga",
      position: "Stores Officer",
      company: "Zambia Law Development Commission",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652646/WhatsApp_Image_2025-09-11_at_21.05.29_bnitmm.jpg",
      rating: 5,
      text: "The workshop organized by Alliance Procurement and Capacity Building in collaboration with Zambia Public Procurement Authority for the Ministry of Community Development and Social Services at Mika Hotel in Chongwe District from 22nd to 24th April, 2025, under the theme ‘Driving Accountability in Public Procurement and Financial Management’ was truly insightful. The training provided practical knowledge and tools that will greatly improve transparency, accountability, and efficiency in my work. I am leaving empowered to contribute more effectively to strengthening financial and procurement systems in my institution"
    },
    {
      id: 5,
      name: " Rita Zimba",
      position: "Stores Officer",
      company: "The Judiciary of Zambia",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652646/WhatsApp_Image_2025-09-11_at_21.03.37_hzp7sd.jpg",
      rating: 5,
      text: "The Stores Officers Training held at Chalimabana Local Government Training Institute in Chongwe District from 27th to 29th August, 2025, was highly beneficial. The sessions on accountability and effective stores management were practical and eye-opening, equipping me with new skills to strengthen controls and improve efficiency in my work. This training has truly enhanced my capacity to deliver with integrity and professionalism."
    },
    {
      id: 6,
      name: "SYDNEY KAPUI",
      position: "ACTING PROCUREMENT AND SUPPLIES ASSISTANT",
      company: "CHELSTONE ZONAL HOSPITAL",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652647/WhatsApp_Image_2025-09-11_at_21.11.33_kqndrq.jpg",
      rating: 5,
      text:"The workshop held at Mika Hotel in Chongwe District from 26th to 28th March, 2025, under the theme ‘Driving Accountability in Public Procurement and Financial Management’ was extremely impactful. The training deepened my understanding of accountability and transparency, while providing practical tools to strengthen procurement and financial management processes. I left the workshop better equipped to uphold integrity and efficiency in my role."
    },
    {
      id: 7,
      name: "Racheal Ngoma",
      position: "Secretary",
      company: "Ministry of Health",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652648/WhatsApp_Image_2025-09-11_at_22.28.17_jhexq4.jpg",
      rating: 5,
      text:"The workshop at Livingstone Lodge in Livingstone District from 23rd to 26th June, 2025 was eye-opening and impactful. The sessions were practical, engaging, and equipped us with modern skills in financial, secretarial, and records management. I left more confident, motivated, and ready to drive innovation in my organization."
    } ,
    {
      id: 8,
      name: "Lorraine mainza",
      position: "Issuing Officer",
      company: "Nitrogen chemicals of Zambi",
      image: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757652647/WhatsApp_Image_2025-09-11_at_21.14.25_fodut4.jpg",
      rating: 5,
      text:"The MoH Stores Officers Workshop, which took place from 27th to 29th August 2025, was very impactful and exceeded my expectations. The training covered critical areas such as stock management, audit preparation, and offenses in public procurement, which are highly relevant to my role as a stores officer. The facilitators were clear, engaging, and brought real-world examples that made the topics easy to understand. I particularly valued the emphasis on teamwork, inclusion, and ethical practices in procurement, which reminded me of the importance of professionalism and integrity in our work. I am grateful for the opportunity to participate, and I believe the knowledge gained will contribute positively to my department and the Ministry at large."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToTestimonial = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-[#87CEEB] fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)` }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#1C356B]/5 rounded-full -translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#87CEEB]/10 rounded-full translate-x-48 translate-y-48" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1C356B] rounded-full mb-6">
            <Quote className="w-8 h-8 text-[#87CEEB]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C356B] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how our procurement and capacity building solutions have transformed businesses across various industries.
          </p>
        </div>

        {/* Testimonials Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Testimonial Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 transition-all duration-500 ${
                isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Client Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#87CEEB]/20">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentIndex].name)}&background=1C356B&color=FDC123&size=150`;
                      }}
                    />
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Stars */}
                  <div className="flex justify-center lg:justify-start mb-4">
                    {renderStars(testimonials[currentIndex].rating)}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonials[currentIndex].text}"
                  </blockquote>

                  {/* Client Info */}
                  <div>
                    <h4 className="text-xl font-bold text-[#1C356B] mb-1">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-[#87CEEB] font-medium mb-1">
                      {testimonials[currentIndex].position}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              onClick={prevTestimonial}
              disabled={isAnimating}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-[#1C356B]/10 hover:border-[#1C356B]/30 text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 disabled:opacity-50"
              variant="ghost"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              onClick={nextTestimonial}
              disabled={isAnimating}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-[#1C356B]/10 hover:border-[#1C356B]/30 text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 disabled:opacity-50"
              variant="ghost"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                disabled={isAnimating}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#1C356B] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                } disabled:opacity-50`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Additional Stats */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl font-bold text-[#1C356B] mb-2">500+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl font-bold text-[#1C356B] mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl font-bold text-[#1C356B] mb-2">50+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}