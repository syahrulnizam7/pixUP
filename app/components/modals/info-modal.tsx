"use client";

import { X, ExternalLink } from "lucide-react";

interface InfoModalProps {
  toggleInfo: () => void;
}

export default function InfoModal({ toggleInfo }: InfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto custom-scrollbar">
      <div className="relative bg-white dark:bg-[#1F2937] rounded-2xl border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={toggleInfo}
          className="absolute top-4 right-4 p-2 bg-white dark:bg-[#374151] rounded-full border-[3px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow duration-200"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4 text-center">
            About PixUp
          </h2>

          <div className="space-y-4">
            <p className="text-base text-[#4B5563] dark:text-[#D1D5DB]">
              PixUp is an AI-powered image enhancement tool designed to
              transform your ordinary photos into stunning visuals. Whether
              you're looking to improve old family photos or enhance images for
              social media, PixUp can help you achieve professional-quality
              results with ease.
            </p>

            <h3 className="text-xl font-bold text-[#1F2937] dark:text-white">
              Key Features
            </h3>
            <ul className="list-disc list-inside text-base text-[#4B5563] dark:text-[#D1D5DB]">
              <li>
                AI-Powered Enhancement: Utilizes advanced artificial
                intelligence to automatically improve image quality.
              </li>
              <li>
                Before & After Comparison: Easily compare the original and
                enhanced images to see the difference.
              </li>
              <li>
                User-Friendly Interface: Simple and intuitive design makes it
                easy for anyone to use.
              </li>
              <li>
                Image Gallery: Store and manage your enhanced images in a
                personal gallery.
              </li>
              <li>
                Dark Mode: Enjoy a comfortable viewing experience in low-light
                conditions.
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#1F2937] dark:text-white">
              How It Works
            </h3>
            <ol className="list-decimal list-inside text-base text-[#4B5563] dark:text-[#D1D5DB]">
              <li>Upload or provide a URL of the image you want to enhance.</li>
              <li>
                Our AI will analyze the image and automatically improve its
                quality.
              </li>
              <li>
                Compare the before and after results and download the enhanced
                image.
              </li>
            </ol>

            <div className="pt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium">
                Powered by Ryzen API
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://syahrul-nizam.my.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#6D28D9] hover:bg-[#5B21B6] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              >
                View My Other Projects
                <ExternalLink size={20} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
