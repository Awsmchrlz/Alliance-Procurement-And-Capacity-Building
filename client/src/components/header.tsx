import { Mail, Instagram, Youtube, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";

export function Header() {
  return (
    <div className="relative h-12 sm:h-16 w-full overflow-hidden">
      {/* White background base */}
      <div className="absolute left-0 top-0 h-full w-full bg-white flex items-center justify-start pl-4 sm:pl-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 space-x-0 sm:space-x-8">
          <span className="text-sm sm:text-lg font-light text-gray-800 whitespace-nowrap">FOLLOW US</span>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <Instagram className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <Youtube className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <Facebook className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <MessageCircle className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <Twitter className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="w-3 h-3 sm:w-7 sm:h-7 bg-white border border-black sm:border-2 rounded-full flex items-center justify-center">
              <Linkedin className="w-2.3 h-2.3 sm:w-4 sm:h-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Yellow section overlaid on top */}
      <div
        className="absolute right-0 top-0 h-full flex items-center justify-center"
        style={{
          width: '50%',
          clipPath: 'polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%)',
          backgroundColor:'#87CEEB'
        }}
      >
        <div className="flex flex-col items-center space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 ml-4 sm:ml-16 pr-4 sm:pr-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-transparent border border-white sm:border-2 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
          </div>
          <a 
            href="mailto:globaltrainingalliance@gmail.com"
            className="text-[10px] leading-tight sm:text-lg font-medium text-gray-800 text-center sm:text-left break-all sm:break-normal max-w-[100px] sm:max-w-none hover:text-white transition-colors duration-200 cursor-pointer"
          >
            globaltrainingalliance@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}