"use client";

import type React from "react";

import { useState, useRef } from "react";
import { X, Download } from "lucide-react";
import type { EnhancedImage } from "@/app/types";

interface ResultModalProps {
  visible: boolean;
  contentVisible: boolean;
  currentResult: EnhancedImage | null;
  closeModal: () => void;
  downloadImage: (url: string, filename: string) => void;
}

export default function ResultModal({
  visible,
  contentVisible,
  currentResult,
  closeModal,
  downloadImage,
}: ResultModalProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Handle slider mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const percentage = Math.min(
      Math.max((x / containerRect.width) * 100, 0),
      100
    );
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - containerRect.left;
    const percentage = Math.min(
      Math.max((x / containerRect.width) * 100, 0),
      100
    );
    setSliderPosition(percentage);
  };

  const handleTouchEnd = () => {
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  if (!visible || !currentResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 custom-scrollbar">
      <div
        className={`relative bg-white dark:bg-[#1F2937] rounded-2xl border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          contentVisible ? "translate-y-0" : "-translate-y-20 opacity-0"
        }`}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 bg-white dark:bg-[#374151] rounded-full border-[3px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow duration-200 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-[#1F2937] dark:text-white mb-6 text-center">
            Compare Before & After
          </h2>

          <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] h-[50vh] max-h-[500px]"
          >
            <img
              src={currentResult.originalUrl || "/placeholder.svg"}
              alt="Original"
              className="absolute left-0 top-0 w-full h-full object-cover"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            />
            <img
              src={currentResult.enhancedUrl || "/placeholder.svg"}
              alt="Enhanced"
              className="w-full h-full object-cover"
            />

            <div
              ref={sliderRef}
              className="absolute top-0 bottom-0 w-1 bg-white dark:bg-[#6D28D9] cursor-move"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-[#374151] rounded-full border-[3px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"></div>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={async () => {
                setIsDownloading(true);
                await downloadImage(
                  currentResult.enhancedUrl,
                  `enhanced-image-${currentResult.id}.jpg`
                );
                setIsDownloading(false);
              }}
              disabled={isDownloading}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#10B981] hover:bg-[#059669] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
            >
              <span className="flex items-center gap-2">
                {isDownloading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Enhanced</span>
                  </>
                )}
              </span>
            </button>
            <button
              onClick={closeModal}
              className="px-6 py-3 rounded-xl font-bold text-[#1F2937] dark:text-white transition-all border-[3px] border-black bg-white dark:bg-[#374151] hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
