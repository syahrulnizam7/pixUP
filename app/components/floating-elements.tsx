"use client";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

export default function FloatingElements() {
  const { theme } = useTheme();
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isSmallMobile: false,
    width: 0,
  });

  useEffect(() => {
    // Function to check viewport width
    const checkScreen = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isSmallMobile: width < 480,
        width: width,
      });
    };

    // Initial check
    checkScreen();

    // Add event listener
    window.addEventListener("resize", checkScreen);

    // Clean up
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Determine which elements to show based on screen size
  const { isMobile, isSmallMobile } = screenSize;

  // Use a reduced set of elements for mobile views
  const elements = [];

  // Always show the circle (top right)
  elements.push(
    <div
      key="circle"
      className={`absolute right-[5%] top-[10%] rounded-full border-black ${
        isMobile
          ? "w-16 h-16 border-[2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          : "w-32 h-32 border-[4px] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
      }`}
      style={{
        backgroundColor: theme === "dark" ? "#FF3333" : "#FF3333",
        animation: "float-circle 15s ease-in-out infinite alternate",
      }}
    />
  );

  // Small dot (always show)
  elements.push(
    <div
      key="dot"
      className={`absolute left-[5%] top-[30%] rounded-full border-black ${
        isMobile
          ? "w-4 h-4 border-[1px] shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
          : "w-6 h-6 border-[2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      }`}
      style={{
        backgroundColor: theme === "dark" ? "#3B82F6" : "#2563EB",
        animation: "float-dot 14s ease-in-out infinite alternate",
      }}
    />
  );

  // Triangle at bottom right (don't show on small mobile)
  if (!isSmallMobile) {
    elements.push(
      <div
        key="triangle"
        className="absolute right-[15%] bottom-[10%]"
        style={{
          width: 0,
          height: 0,
          borderLeft: isMobile
            ? "20px solid transparent"
            : "40px solid transparent",
          borderRight: isMobile
            ? "20px solid transparent"
            : "40px solid transparent",
          borderBottom: `${isMobile ? "40px" : "80px"} solid ${
            theme === "dark" ? "#0099CC" : "#0066AA"
          }`,
          filter: isMobile
            ? "drop-shadow(2px 2px 0 black)"
            : "drop-shadow(3px 3px 0 black)",
          animation: "float-triangle 20s ease-in-out infinite alternate",
        }}
      />
    );
  }

  // Small square at left (don't show on small mobile)
  if (!isSmallMobile) {
    elements.push(
      <div
        key="square"
        className={`absolute left-[3%] top-[70%] border-black ${
          isMobile
            ? "w-10 h-10 border-[2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            : "w-16 h-16 border-[3px] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "#FFCC00" : "#F59E0B",
          animation: "float-square 18s ease-in-out infinite alternate-reverse",
          transform: "rotate(15deg)",
        }}
      />
    );
  }

  if (!isMobile) {
    elements.push(
      <div
        key="star"
        className="absolute right-[55%] top-[50%]"
        style={{
          animation: "float-star 22s ease-in-out infinite alternate",
          transform: "scale(0.6)",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path
            d="M50 0 L63 38 L100 38 L69 59 L81 100 L50 75 L19 100 L31 59 L0 38 L37 38 Z"
            fill={theme === "dark" ? "#10B981" : "#059669"}
            stroke="black"
            strokeWidth="4"
          />
        </svg>
      </div>
    );
  }

  if (screenSize.width > 640) {
    elements.push(
      <div
        key="donut"
        className={`absolute right-[30%] bottom-[25%] rounded-full border-black ${
          isMobile ? "w-16 h-16 border-[2px]" : "w-20 h-20 border-[3px]"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "#6D28D9" : "#5B21B6",
          animation: "float-donut 17s ease-in-out infinite alternate-reverse",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full border-black ${
              isMobile ? "w-8 h-8 border-[2px]" : "w-10 h-10 border-[3px]"
            }`}
            style={{
              backgroundColor: theme === "dark" ? "#0A1A2A" : "#E6F7FF",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {elements}
    </div>
  );
}
