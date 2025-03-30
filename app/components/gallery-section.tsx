"use client";

import { useState } from "react";
import { ImageIcon, Download, Trash2, Grid, List, Trash } from "lucide-react";
import type { EnhancedImage } from "../types";

interface GallerySectionProps {
  enhancedImages: EnhancedImage[];
  showCompareModal: (image: EnhancedImage) => void;
  confirmDelete: (id: string) => void;
  confirmDeleteAll: () => void;
  downloadImage: (url: string, filename: string) => void;
}

export default function GallerySection({
  enhancedImages,
  showCompareModal,
  confirmDelete,
  confirmDeleteAll,
  downloadImage,
}: GallerySectionProps) {
  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="inline-block bg-[#FFCC00] px-6 py-3 rounded-xl border-[3px] border-black transform -rotate-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-3xl md:text-4xl font-black text-black">
            Your Gallery
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-[#1F2937] p-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center">
              <button
                onClick={() => setGalleryView("grid")}
                className={`p-2 rounded-lg ${
                  galleryView === "grid"
                    ? "bg-[#6D28D9] text-white"
                    : "text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
                }`}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setGalleryView("list")}
                className={`p-2 rounded-lg ${
                  galleryView === "list"
                    ? "bg-[#6D28D9] text-white"
                    : "text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
                }`}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {enhancedImages.length > 0 && (
            <button
              onClick={confirmDeleteAll}
              className="px-4 py-2 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#EF4444] hover:bg-[#DC2626] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-2"
            >
              <Trash size={16} />
              <span>Delete All</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        {enhancedImages.length > 0 ? (
          <>
            {galleryView === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {enhancedImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden border-[3px] border-black transition-all duration-300 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 animate-card-in bg-white dark:bg-[#1F2937]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className="relative aspect-square overflow-hidden cursor-pointer"
                      onClick={() => showCompareModal(img)}
                    >
                      <img
                        src={img.enhancedUrl || "/placeholder.svg"}
                        alt="Enhanced"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-[#F59E0B] text-black font-bold px-2 py-1 border-b-[3px] border-l-[3px] border-black text-sm">
                        Enhanced
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          {formatDate(img.timestamp)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              setDownloadingId(img.id);
                              await downloadImage(
                                img.enhancedUrl,
                                `enhanced-image-${img.id}.jpg`
                              );
                              setDownloadingId(null);
                            }}
                            disabled={downloadingId === img.id}
                            className="p-1 rounded-lg text-[#10B981] hover:bg-[#10B981] hover:text-white"
                            title="Download"
                          >
                            {downloadingId === img.id ? (
                              <span className="h-4 w-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin inline-block"></span>
                            ) : (
                              <Download size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => confirmDelete(img.id)}
                            className="p-1 rounded-lg text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1F2937] rounded-xl border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {enhancedImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="p-4 flex items-center justify-between animate-card-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="relative w-16 h-16 rounded-xl overflow-hidden border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer"
                          onClick={() => showCompareModal(img)}
                        >
                          <img
                            src={img.enhancedUrl || "/placeholder.svg"}
                            alt="Enhanced"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 bg-[#F59E0B] text-black font-bold px-2 py-1 border-b-[3px] border-l-[3px] border-black text-xs">
                            Enhanced
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2937] dark:text-white">
                            {formatDate(img.timestamp)}
                          </p>
                          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            Original:{" "}
                            <a
                              href={img.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6D28D9] dark:text-[#C4B5FD] hover:underline"
                            >
                              View
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            setDownloadingId(img.id);
                            await downloadImage(
                              img.enhancedUrl,
                              `enhanced-image-${img.id}.jpg`
                            );
                            setDownloadingId(null);
                          }}
                          disabled={downloadingId === img.id}
                          className="px-3 py-2 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#10B981] hover:bg-[#059669] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          title="Download"
                        >
                          {downloadingId === img.id ? (
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => confirmDelete(img.id)}
                          className="px-3 py-2 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#EF4444] hover:bg-[#DC2626] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1F2937] rounded-xl border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <ImageIcon className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No enhanced images yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
