"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  Moon,
  Sun,
  ImageIcon,
  Upload,
  LinkIcon,
  Trash2,
  X,
  Download,
  ArrowRight,
  Camera,
  Layers,
  Maximize,
  Minimize,
  Info,
  Zap,
} from "lucide-react";

interface EnhancedImage {
  id: string;
  originalUrl: string;
  enhancedUrl: string;
  timestamp: Date;
}

export default function PixUp() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<EnhancedImage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContentVisible, setModalContentVisible] =
    useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Default closed on mobile
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Cloudinary configuration
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

  // Check for mobile and user's preferred color scheme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
        // Close sidebar by default on mobile
        setSidebarOpen(window.innerWidth >= 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      const isDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(isDark);

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  // Load history from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem("pixup-enhanced-images");
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        const withDates = parsed.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp),
        }));
        setEnhancedImages(withDates);
      } catch (e) {
        console.error("Failed to parse saved images", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(
      "pixup-enhanced-images",
      JSON.stringify(enhancedImages)
    );
  }, [enhancedImages]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      showPreview(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      showPreview(e.target.files[0]);
    }
  };

  const showPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadToCloudinary = async (
    file: File | Blob,
    fileName = "image"
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", `${fileName}-${Date.now()}`);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleEnhanceImage = async () => {
    if (!previewUrl) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Convert data URL to Blob
      const blob = await fetch(previewUrl).then((r) => r.blob());
      const file = new File([blob], "preview-image", { type: blob.type });

      // Upload original image to Cloudinary
      const uploadedImageUrl = await uploadToCloudinary(file, "original");
      setImageUrl(uploadedImageUrl);
      setSuccess("Image uploaded successfully! Now enhancing...");

      // Enhance with Ryzen API
      const enhancedImage = await enhanceImage(uploadedImageUrl);

      // Save to history
      const newEnhancedImage: EnhancedImage = {
        id: uuidv4(),
        originalUrl: uploadedImageUrl,
        enhancedUrl: enhancedImage,
        timestamp: new Date(),
      };

      setEnhancedImages((prev) => [newEnhancedImage, ...prev]);
      setSuccess("Image enhanced successfully!");
      setPreviewUrl(null);

      // Show result modal
      setCurrentResult(newEnhancedImage);
      showModal();
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process image. Please try again."
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlEnhancement = async () => {
    if (!imageUrl) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      setSuccess("Processing URL image...");

      // Enhance directly with Ryzen API
      const enhancedImage = await enhanceImage(imageUrl);

      // Save to history
      const newEnhancedImage: EnhancedImage = {
        id: uuidv4(),
        originalUrl: imageUrl,
        enhancedUrl: enhancedImage,
        timestamp: new Date(),
      };

      setEnhancedImages((prev) => [newEnhancedImage, ...prev]);
      setSuccess("Image enhanced successfully!");

      // Show result modal
      setCurrentResult(newEnhancedImage);
      showModal();
    } catch (err) {
      console.error("Error enhancing URL image:", err);
      setError(
        "Failed to enhance image from URL. Please check the URL and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceImage = async (url: string): Promise<string> => {
    try {
      // Call Ryzen API to enhance the image
      const response = await axios.get(
        `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(
          url
        )}`,
        {
          responseType: "arraybuffer",
        }
      );

      // Convert to Blob and upload to Cloudinary
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "image/jpeg",
      });

      return await uploadToCloudinary(blob, "enhanced");
    } catch (err) {
      console.error("Error enhancing image:", err);
      throw new Error("Failed to enhance image");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const showCompareModal = (image: EnhancedImage) => {
    setCurrentResult(image);
    setSliderPosition(50); // Reset slider position
    showModal();
  };

  const showModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalContentVisible(true);
    }, 50);
  };

  const closeModal = () => {
    setModalContentVisible(false);
    setTimeout(() => {
      setModalVisible(false);
      setCurrentResult(null);
    }, 300);
  };

  const deleteImage = (id: string) => {
    setEnhancedImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteConfirmId(null);
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const navigateGallery = (direction: "next" | "prev") => {
    if (enhancedImages.length === 0) return;

    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % enhancedImages.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + enhancedImages.length) % enhancedImages.length
      );
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen grid-bg relative">
        {/* App Layout */}
        <div className="flex flex-col h-screen relative z-10">
          {/* Header */}
          <header className="py-4 px-6 bg-black z-40 relative border-b-4 border-[#333]">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/logopixup.png"
                    alt="PixUp Logo"
                    className="h-12 md:h-16"
                  />
                </div>
                <button
                  onClick={toggleInfo}
                  className="ml-2 p-2 rounded-full bg-white border-4 border-black text-black hover:bg-[#FFDD00] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  title="About PixUp"
                >
                  <Info size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg bg-white border-4 border-black text-black hover:bg-[#FFDD00] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                  aria-label={sidebarOpen ? "Hide gallery" : "Show gallery"}
                >
                  {sidebarOpen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-white border-4 border-black text-black hover:bg-[#FFDD00] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto transition-all duration-300">
              <div className="p-6 md:p-10 max-w-5xl mx-auto">
                {/* Enhancement Section */}
                <section className="mb-10">
                  <div className="mb-8">
                    <div className="relative inline-block">
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-black dark:text-white transform skew-x-[-5deg] relative">
                        Enhance Your Image
                        <span className="absolute -top-2 -right-6 text-2xl">
                          ⚡
                        </span>
                      </h2>
                      <div className="absolute -bottom-2 left-0 h-4 w-full bg-[#FFDD00] -z-10"></div>
                    </div>
                    <p className="text-lg max-w-2xl text-black dark:text-white mt-6">
                      Upload your image or provide a URL to get started with our
                      AI enhancement technology.
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex mb-8">
                    <div className="flex border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <button
                        onClick={() => setActiveTab("upload")}
                        className={`px-6 py-3 font-bold text-lg transition-all flex items-center gap-2 ${
                          activeTab === "upload"
                            ? "bg-[#00A1E4] text-white"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <Camera size={20} />
                        <span>Upload Image</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("url")}
                        className={`px-6 py-3 font-bold text-lg transition-all flex items-center gap-2 ${
                          activeTab === "url"
                            ? "bg-[#FF3333] text-white"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <LinkIcon size={20} />
                        <span>Image URL</span>
                      </button>
                    </div>
                  </div>

                  {activeTab === "upload" &&
                    (!previewUrl ? (
                      <div
                        ref={dropAreaRef}
                        className={`relative border-4 border-black rounded-xl p-8 text-center transition-all duration-300 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                          isDragging
                            ? "border-[#FF3333] bg-[#FF3333]/20"
                            : "bg-white dark:bg-[#1E1E1E]"
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-6 py-6 relative z-10">
                          <div className="flex justify-center">
                            <div className="w-28 h-28 rounded-xl border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-transform hover:rotate-3 bg-[#FFDD00]">
                              <ImageIcon className="w-14 h-14 text-black" />
                            </div>
                          </div>
                          <h2 className="text-2xl font-black text-black dark:text-white transform skew-x-[-5deg]">
                            Drag & Drop your image here
                          </h2>
                          <p className="text-xl font-medium text-black dark:text-white">
                            or
                          </p>
                          <button
                            onClick={triggerFileInput}
                            disabled={isLoading}
                            className={`px-6 py-3 rounded-xl font-bold text-white transition-all border-4 border-black bg-[#FF3333] hover:bg-[#FF4444] transform hover:-translate-y-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            } relative overflow-hidden`}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <Upload className="w-5 h-5" />
                              <span className="text-lg">Browse Files</span>
                            </span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFDD00] rounded-full border-2 border-black"></span>
                            <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#00A1E4] rounded-full border-2 border-black"></span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl p-6 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden bg-white dark:bg-[#1E1E1E]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDD00] clip-triangle"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00A1E4] clip-triangle-bottom-left"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-black"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-black"></div>

                        <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-black dark:text-white transform skew-x-[-5deg]">
                          Preview Image
                        </h2>
                        <div className="flex flex-col items-center relative z-10">
                          <div className="relative w-full max-w-md aspect-square mb-6 rounded-xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:rotate-1 transition-transform">
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-contain bg-white"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
                          </div>
                          <div className="flex flex-wrap gap-4 justify-center">
                            <button
                              onClick={clearPreview}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-xl font-bold text-black transition-all border-4 border-black bg-white hover:bg-gray-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:shadow-none active:translate-y-0"
                            >
                              Choose Different Image
                            </button>
                            <button
                              onClick={handleEnhanceImage}
                              disabled={isLoading}
                              className={`px-4 py-2 rounded-xl font-bold text-white transition-all border-4 border-black bg-[#FF3333] hover:bg-[#FF4444] transform hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                              } relative overflow-hidden`}
                            >
                              {isLoading ? (
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Enhancing...
                                </span>
                              ) : (
                                <span className="relative z-10 flex items-center gap-2">
                                  <Zap className="w-5 h-5" />
                                  <span>Enhance Now</span>
                                </span>
                              )}
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFDD00] rounded-full border-2 border-black"></span>
                              <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#00A1E4] rounded-full border-2 border-black"></span>
                            </button>
                          </div>
                          {uploadProgress > 0 && (
                            <div className="w-full max-w-md mt-6">
                              <div className="w-full rounded-full h-4 border-2 border-black overflow-hidden bg-white">
                                <div
                                  className="bg-[#00A1E4] h-full rounded-full transition-all duration-300 progress-animation"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-sm font-bold mt-2 text-center text-black dark:text-white">
                                Uploading: {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {activeTab === "url" && (
                    <div className="rounded-xl p-6 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden bg-white dark:bg-[#1E1E1E]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDD00] clip-triangle"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00A1E4] clip-triangle-bottom-left"></div>
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-black"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-black"></div>

                      <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-black dark:text-white transform skew-x-[-5deg]">
                        Enter Image URL
                      </h2>

                      <div className="relative z-10 space-y-6">
                        <div className="relative">
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL here"
                            className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A1E4] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg bg-white text-black dark:text-white dark:bg-[#2A2A2A] placeholder-gray-500"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFDD00] rounded-full border-2 border-black"></div>
                          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#00A1E4] rounded-full border-2 border-black"></div>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={handleUrlEnhancement}
                            disabled={isLoading || !imageUrl}
                            className={`px-6 py-3 rounded-xl font-bold text-white transition-all border-4 border-black bg-[#FF3333] hover:bg-[#FF4444] transform hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 ${
                              isLoading || !imageUrl
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } relative overflow-hidden`}
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              <span className="relative z-10 flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                <span className="text-lg">
                                  Enhance URL Image
                                </span>
                              </span>
                            )}
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00A1E4] rounded-full border-2 border-black"></span>
                            <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#FFDD00] rounded-full border-2 border-black"></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {error && (
                    <div className="mt-6 p-4 border-4 border-[#FF3333] rounded-xl animate-bounce-in shadow-[8px_8px_0px_0px_rgba(255,51,51,1)] bg-white dark:bg-[#1E1E1E]">
                      <p className="text-[#FF3333] font-bold flex items-center text-lg">
                        <span className="inline-block w-6 h-6 bg-[#FF3333] text-white rounded-full mr-3 flex items-center justify-center font-bold">
                          !
                        </span>
                        {error}
                      </p>
                    </div>
                  )}
                  {success && (
                    <div className="mt-6 p-4 border-4 border-[#00C853] rounded-xl animate-bounce-in shadow-[8px_8px_0px_0px_rgba(0,200,83,1)] bg-white dark:bg-[#1E1E1E]">
                      <p className="text-[#00C853] font-bold flex items-center text-lg">
                        <span className="inline-block w-6 h-6 bg-[#00C853] text-white rounded-full mr-3 flex items-center justify-center font-bold">
                          ✓
                        </span>
                        {success}
                      </p>
                    </div>
                  )}
                </section>

                {/* Gallery Preview */}
                {enhancedImages.length > 0 && !sidebarOpen && (
                  <section className="mt-10 animate-slide-up">
                    <div className="mb-6">
                      <div className="relative inline-block">
                        <h2 className="text-2xl md:text-3xl font-black mb-4 text-black dark:text-white transform skew-x-[-5deg] relative">
                          Recent Enhancements
                          <span className="absolute -top-2 -right-6 text-2xl">
                            ⚡
                          </span>
                        </h2>
                        <div className="absolute -bottom-2 left-0 h-4 w-full bg-[#FFDD00] -z-10"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {enhancedImages.slice(0, 4).map((img, index) => (
                        <div
                          key={img.id}
                          className="rounded-xl overflow-hidden border-4 border-black transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 animate-card-in cursor-pointer bg-white dark:bg-[#1E1E1E]"
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => showCompareModal(img)}
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={img.enhancedUrl || "/placeholder.svg"}
                              alt="Enhanced"
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute top-0 right-0 bg-[#FFDD00] text-black font-bold px-3 py-1 border-b-4 border-l-4 border-black">
                              Enhanced
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        onClick={toggleSidebar}
                        className="px-4 py-2 rounded-xl font-bold text-black transition-all border-4 border-black bg-white hover:bg-gray-100 transform hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 flex items-center gap-2 mx-auto"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </main>

            {/* Sidebar Gallery */}
            {sidebarOpen && (
              <aside className="w-full md:w-96 border-l-4 border-black overflow-y-auto transition-all duration-300 bg-white dark:bg-[#1A1A1A]">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative inline-block">
                      <h2 className="text-2xl font-black text-black dark:text-white transform skew-x-[-5deg] relative">
                        Your Gallery
                        <span className="absolute -top-2 -right-6 text-2xl">
                          ⚡
                        </span>
                      </h2>
                      <div className="absolute -bottom-2 left-0 h-4 w-full bg-[#FFDD00] -z-10"></div>
                    </div>
                  </div>

                  {enhancedImages.length > 0 ? (
                    <div className="space-y-6">
                      {enhancedImages.map((img, index) => (
                        <div
                          key={img.id}
                          className="rounded-xl overflow-hidden border-4 border-black transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 animate-card-in bg-white dark:bg-[#1E1E1E]"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="relative group">
                            <div className="relative aspect-square overflow-hidden">
                              <img
                                src={img.enhancedUrl || "/placeholder.svg"}
                                alt="Enhanced"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-0 right-0 bg-[#FFDD00] text-black font-bold px-3 py-1 border-b-4 border-l-4 border-black">
                                Enhanced
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex justify-between items-center">
                            <button
                              onClick={() => showCompareModal(img)}
                              className="px-3 py-2 rounded-xl font-bold text-white transition-all border-4 border-black bg-[#00A1E4] hover:bg-[#33B5E8] transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 relative overflow-hidden"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <Layers size={16} />
                                <span>Compare</span>
                              </span>
                            </button>

                            {deleteConfirmId === img.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteImage(img.id)}
                                  className="p-2 rounded-xl font-bold text-white transition-all border-4 border-black bg-red-500 hover:bg-red-600 transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0"
                                  title="Confirm Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="p-2 rounded-xl font-bold text-black transition-all border-4 border-black bg-white hover:bg-gray-100 transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => confirmDelete(img.id)}
                                className="p-2 rounded-xl font-bold text-black transition-all border-4 border-black bg-white hover:bg-gray-100 transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0"
                                title="Delete Image"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(img.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border-4 border-dashed border-gray-400 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2 text-black dark:text-white">
                        No images yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enhanced images will appear here
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {modalVisible && (
        <div
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300 ${
            modalContentVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-white dark:bg-[#1E1E1E] rounded-xl border-4 border-black max-w-3xl w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-transform duration-300 ${
              modalContentVisible ? "scale-100" : "scale-90"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b-4 border-black flex justify-between items-center bg-[#FF3333]">
              <h3 className="text-2xl font-bold text-white relative transform skew-x-[-5deg]">
                <span className="relative z-10">⚡ Enhanced Result ⚡</span>
              </h3>
              <button
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black border-2 border-black hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {currentResult && (
              <div className="p-6">
                <div
                  className="relative w-full max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                  ref={containerRef}
                >
                  {/* Original image (background) */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={currentResult.originalUrl || "/placeholder.svg"}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Enhanced image (foreground) - fixed position */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    }}
                  >
                    <img
                      src={currentResult.enhancedUrl || "/placeholder.svg"}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Slider */}
                  <div
                    ref={sliderRef}
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                  >
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white rounded-md flex items-center justify-center border-2 border-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-black"
                      >
                        <path d="M18 8L22 12L18 16" />
                        <path d="M6 8L2 12L6 16" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 rounded-lg font-bold text-sm border-2 border-white">
                    Enhanced
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[#FF3333] text-white px-3 py-1 rounded-lg font-bold text-sm border-2 border-white">
                    Original
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <a
                    href={currentResult.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl font-bold text-black transition-all border-4 border-black bg-white hover:bg-gray-100 transform hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 flex items-center gap-2"
                  >
                    <Download size={18} />
                    <span>Download Original</span>
                  </a>
                  <a
                    href={currentResult.enhancedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl font-bold text-white transition-all border-4 border-black bg-[#00A1E4] hover:bg-[#33B5E8] transform hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 flex items-center gap-2"
                  >
                    <Download size={18} />
                    <span>Download Enhanced</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300 opacity-100"
          onClick={toggleInfo}
        >
          <div
            className="bg-white dark:bg-[#1E1E1E] rounded-xl border-4 border-black max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-transform duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b-4 border-black flex justify-between items-center bg-[#00A1E4]">
              <h3 className="text-xl font-bold text-black relative transform skew-x-[-5deg]">
                <span className="relative z-10">About PixUp</span>
                <span className="absolute -top-2 -right-6 text-xl">⚡</span>
              </h3>
              <button
                onClick={toggleInfo}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black border-2 border-black hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-black dark:text-white">
                PixUp is an AI-powered image enhancement tool that uses advanced
                technology to improve photos.
              </p>
              <p className="mb-4 text-black dark:text-white">
                Simply upload an image or provide a URL, and the enhancement
                process will be applied automatically.
              </p>
              <p className="mb-4 text-black dark:text-white">
                All enhanced images are saved in the gallery for easy access and
                comparison.
              </p>
              <div className="p-4 rounded-xl border-4 border-[#00A1E4] bg-white dark:bg-[#2A2A2A]">
                <h4 className="font-bold mb-2 text-black dark:text-white">
                  Features:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-black dark:text-white">
                  <li>AI-powered image enhancement</li>
                  <li>Side-by-side comparison</li>
                  <li>Image history and gallery</li>
                  <li>Dark mode support</li>
                  <li>Download original and enhanced images</li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Powered by{" "}
                <span className="font-bold text-[#00A1E4]">Ryzen API</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .grid-bg {
          background-color: ${darkMode ? "#121212" : "#f8f8f8"};
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .dark .grid-bg {
          background-color: #121212;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes card-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-card-in {
          animation: card-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .clip-triangle {
          clip-path: polygon(100% 0, 0 0, 100% 100%);
        }

        .clip-triangle-bottom-left {
          clip-path: polygon(0 100%, 0 0, 100% 100%);
        }

        .progress-animation {
          background: repeating-linear-gradient(
            45deg,
            #00a1e4,
            #00a1e4 10px,
            #33b5e8 10px,
            #33b5e8 20px
          );
          animation: progress-stripe 1s linear infinite;
        }

        @keyframes progress-stripe {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 28px 0;
          }
        }

        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
