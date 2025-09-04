import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutSection() {
  const coreValues = [
    "Dependability",
    "Integrity",
    "Confidentiality",
    "Accountability",
    "Professionalism",
    "Transparency",
    "Fairness"
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-dark-gray transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-primary-blue dark:text-white mb-6" data-testid="about-title">
              WHO IS ALLIANCE
            </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed" data-testid="about-description-1">
        Alliance Procurement and Capacity Building Limited (APCBL) is a Zambian-owned private company
        established and registered under the Patents and Companies Registration Agency (PACRA) on 16th
        November, 2022. Our main objective is to enhance practitioners&#39; and stakeholders&#39; procurement and
        supply chain management technical skills, competencies, knowledge and capabilities to supplement the
        Government’s effort in improving service delivery in the public and private sectors through training
        workshops and capacity development.
         </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-primary-blue dark:text-white mb-4" data-testid="core-values-title">
                Our Core Values
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {coreValues.map((value, index) => (
                  <div key={index} className="flex items-center" data-testid={`core-value-${index}`}>
                    <CheckCircle className="text-primary-yellow mr-3 w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="bg-primary-yellow text-primary-blue hover:bg-yellow-400" data-testid="about-learn-more"
             onClick={() => window.location.href = "/about"}>
              Learn More About Our Mission
            </Button>
          </div>

          <div>
            <img
              src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg"
              alt="Modern office environment with professionals collaborating"
              className="rounded-2xl shadow-lg w-full"
              data-testid="about-office-image"
            />

            <div className="bg-primary-blue text-white rounded-2xl p-8 -mt-20 ml-8 relative z-10 shadow-xl">
              <h3 className="text-xl font-bold mb-4" data-testid="vision-title">Our Vision</h3>
              <p className="leading-relaxed" data-testid="vision-description">
                To be a leading training, research and consultancy company for public and private sector supply chain systems and processes in the Southern Africa Region and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
