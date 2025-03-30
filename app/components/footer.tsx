import { Github, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <Link
              href="https://alangkun.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F2937] dark:text-white font-bold hover:text-[#6D28D9] dark:hover:text-[#C4B5FD] transition-colors duration-200"
            >
              by Alangkun
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link
              href="https://github.com/syahrulnizam7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F2937] dark:text-white hover:text-[#6D28D9] dark:hover:text-[#C4B5FD] transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github size={24} />
            </Link>
            <Link
              href="https://instagram.com/alang.kun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F2937] dark:text-white hover:text-[#6D28D9] dark:hover:text-[#C4B5FD] transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
