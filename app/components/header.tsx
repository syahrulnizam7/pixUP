"use client";

import { useState, useEffect } from "react";
import { Menu, Info, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

interface HeaderProps {
  activeSection: "enhance" | "gallery";
  setActiveSection: (section: "enhance" | "gallery") => void;
  toggleInfo: () => void;
}

export default function Header({
  activeSection,
  setActiveSection,
  toggleInfo,
}: HeaderProps) {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  // Check for mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Toggle mobile navigation
  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0066AA] dark:bg-[#004488] border-b-[6px] border-black shadow-[0_4px_0_0_rgba(255,255,255,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logopixup-sp4tBXkkrRIEhMP70zq8ERW0tFS1yJ.png"
                alt="PixUp Logo"
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveSection("enhance")}
              className={`px-4 py-2 font-bold text-white border-[3px] border-black rounded-xl transition-all ${
                activeSection === "enhance"
                  ? "bg-[#FF3333] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  : "bg-transparent hover:bg-[#0099CC] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              }`}
            >
              Enhance
            </button>
            <button
              onClick={() => setActiveSection("gallery")}
              className={`px-4 py-2 font-bold text-white border-[3px] border-black rounded-xl transition-all ${
                activeSection === "gallery"
                  ? "bg-[#FF3333] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  : "bg-transparent hover:bg-[#0099CC] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              }`}
            >
              Gallery
            </button>
            <button
              onClick={toggleInfo}
              className="p-2 bg-white text-[#0099CC] border-[3px] border-black rounded-xl hover:bg-[#F5F3FF] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              aria-label="About PixUp"
            >
              <Info size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-white text-[#0099CC] border-[3px] border-black rounded-xl hover:bg-[#F5F3FF] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleNav}
              className="p-2 bg-white text-[#0099CC] border-[3px] border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {navOpen && (
        <div className="md:hidden bg-[#0099CC] dark:bg-[#007399] border-t-[3px] border-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setActiveSection("enhance");
                setNavOpen(false);
              }}
              className={`w-full text-left px-3 py-2 font-bold text-white border-[3px] border-black rounded-xl transition-all ${
                activeSection === "enhance"
                  ? "bg-[#FF3333] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  : "bg-transparent"
              }`}
            >
              Enhance
            </button>
            <button
              onClick={() => {
                setActiveSection("gallery");
                setNavOpen(false);
              }}
              className={`w-full text-left px-3 py-2 font-bold text-white border-[3px] border-black rounded-xl transition-all ${
                activeSection === "gallery"
                  ? "bg-[#FF3333] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  : "bg-transparent"
              }`}
            >
              Gallery
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  toggleInfo();
                  setNavOpen(false);
                }}
                className="flex-1 p-2 bg-white text-[#6D28D9] border-[3px] border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <div className="flex justify-center items-center">
                  <Info size={20} className="mr-2" />
                  <span>About</span>
                </div>
              </button>
              <button
                onClick={() => {
                  toggleDarkMode();
                  setNavOpen(false);
                }}
                className="flex-1 p-2 bg-white text-[#6D28D9] border-[3px] border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <div className="flex justify-center items-center">
                  {theme === "dark" ? (
                    <Sun size={20} className="mr-2" />
                  ) : (
                    <Moon size={20} className="mr-2" />
                  )}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
