"use client";

import type React from "react";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ImageIcon,
  Upload,
  LinkIcon,
  RotateCcw,
  Sparkles,
  Loader,
  Camera,
  Info,
  Zap,
  ArrowRight,
  Check,
  ExternalLink,
  Trash2,
  Download,
} from "lucide-react";
import { uploadToCloudinary, enhanceImage } from "../services/image-service";
import type { EnhancedImage } from "../types";

interface EnhanceSectionProps {
  enhancedImages: EnhancedImage[];
  setEnhancedImages: React.Dispatch<React.SetStateAction<EnhancedImage[]>>;
  showCompareModal: (image: EnhancedImage) => void;
  deleteImage: (id: string) => void;
  confirmDelete: (id: string) => void;
  setActiveSection: (section: "enhance" | "gallery") => void;
  downloadImage: (url: string, filename: string) => void;
}

export default function EnhanceSection({
  enhancedImages,
  setEnhancedImages,
  showCompareModal,
  deleteImage,
  confirmDelete,
  setActiveSection,
  downloadImage,
}: EnhanceSectionProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Cloudinary configuration
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

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
      const uploadedImageUrl = await uploadToCloudinary(
        file,
        "original",
        cloudName,
        uploadPreset,
        setUploadProgress
      );

      setImageUrl(uploadedImageUrl);
      setSuccess("Image uploaded successfully! Now enhancing...");

      // Enhance with Ryzen API
      const enhancedImageUrl = await enhanceImage(
        uploadedImageUrl,
        cloudName,
        uploadPreset
      );

      // Save to history
      const newEnhancedImage: EnhancedImage = {
        id: uuidv4(),
        originalUrl: uploadedImageUrl,
        enhancedUrl: enhancedImageUrl,
        timestamp: new Date(),
      };

      setEnhancedImages((prev: EnhancedImage[]) => [newEnhancedImage, ...prev]);
      setSuccess("Image enhanced successfully!");
      setPreviewUrl(null);

      // Show result modal
      showCompareModal(newEnhancedImage);
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
      const enhancedImageUrl = await enhanceImage(
        imageUrl,
        cloudName,
        uploadPreset
      );

      // Save to history
      const newEnhancedImage: EnhancedImage = {
        id: uuidv4(),
        originalUrl: imageUrl,
        enhancedUrl: enhancedImageUrl,
        timestamp: new Date(),
      };

      setEnhancedImages((prev: EnhancedImage[]) => [newEnhancedImage, ...prev]);
      setSuccess("Image enhanced successfully!");

      // Show result modal
      showCompareModal(newEnhancedImage);
    } catch (err) {
      console.error("Error enhancing URL image:", err);
      setError(
        "Failed to enhance image from URL. Please check the URL and try again."
      );
    } finally {
      setIsLoading(false);
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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="inline-block bg-[#FFCC00] px-6 py-3 rounded-xl border-[3px] border-black transform -rotate-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-3xl md:text-4xl font-black text-black">
            AI Image Enhancer
          </h1>
        </div>
        <p className="mt-6 text-lg text-[#4B5563] dark:text-[#D1D5DB] max-w-3xl">
          Transform your ordinary photos into stunning visuals with our
          AI-powered enhancement tool. Upload an image or provide a URL to get
          started.
        </p>
      </div>

      {/* Method Selector */}
      <div className="mb-8">
        <div className="inline-flex bg-white dark:bg-[#1F2937] p-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-[#0099CC] text-white border-[3px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                : "text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
            }`}
          >
            <Upload size={20} />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              activeTab === "url"
                ? "bg-[#6D28D9] text-white border-[3px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                : "text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
            }`}
          >
            <LinkIcon size={20} />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      {activeTab === "upload" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div className="order-1">
            {!previewUrl ? (
              <div
                ref={dropAreaRef}
                className={`relative rounded-2xl border-[3px] border-black transition-all duration-300 overflow-hidden ${
                  isDragging
                    ? "bg-[#C4B5FD] shadow-[inset_0_0_0_4px_#6D28D9]"
                    : "bg-white dark:bg-[#1F2937] shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-[#F59E0B] rounded-2xl border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform rotate-3">
                      <ImageIcon className="w-12 h-12 text-black" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
                    Drag & Drop Image Here
                  </h2>
                  <p className="text-[#4B5563] dark:text-[#D1D5DB] mb-6">
                    or select a file from your computer
                  </p>
                  <button
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#6D28D9] hover:bg-[#5B21B6] transform hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Camera size={20} />
                      <span>Browse Files</span>
                    </span>
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

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFCC00] border-l-[3px] border-b-[3px] border-black rounded-bl-xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#0099CC] border-r-[3px] border-t-[3px] border-black rounded-tr-xl"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1F2937] rounded-2xl border-[3px] border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4 text-center">
                  Preview Image
                </h2>
                <div className="relative w-full aspect-square mb-6 rounded-xl overflow-hidden border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-contain bg-white dark:bg-[#374151]"
                  />
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={clearPreview}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl font-bold text-[#1F2937] dark:text-white transition-all border-[3px] border-black bg-white dark:bg-[#374151] hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw size={18} />
                      <span>Choose Different</span>
                    </span>
                  </button>
                  <button
                    onClick={handleEnhanceImage}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#FF3333] hover:bg-[#FF4444] transform hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Enhancing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} />
                        <span>Enhance Now</span>
                      </span>
                    )}
                  </button>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full mt-6">
                    <div className="w-full rounded-full h-4 border-[3px] border-black overflow-hidden bg-white dark:bg-[#374151]">
                      <div
                        className="bg-[#6D28D9] h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-bold mt-2 text-center text-[#4B5563] dark:text-[#D1D5DB]">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="order-2">
            <div className="bg-[#0099CC] dark:bg-[#0077AA] rounded-2xl border-[3px] border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFCC00] rounded-bl-full border-l-[3px] border-b-[3px] border-black"></div>

              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 relative z-10">
                How It Works
              </h2>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#6D28D9] rounded-full border-[3px] border-black flex items-center justify-center font-bold text-[#6D28D9] dark:text-white">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">
                      Upload Your Image
                    </h3>
                    <p className="text-[#1F2937] dark:text-[#E5E7EB]">
                      Drag & drop or select an image file
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#6D28D9] rounded-full border-[3px] border-black flex items-center justify-center font-bold text-[#6D28D9] dark:text-white">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">
                      AI Processing
                    </h3>
                    <p className="text-[#1F2937] dark:text-[#E5E7EB]">
                      Our advanced AI analyzes and enhances your image
                      automatically
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#6D28D9] rounded-full border-[3px] border-black flex items-center justify-center font-bold text-[#6D28D9] dark:text-white">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">
                      Get Results
                    </h3>
                    <p className="text-[#1F2937] dark:text-[#E5E7EB]">
                      Compare before & after, then download your enhanced image
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white dark:bg-[#1F2937] rounded-xl border-[3px] border-black relative z-10">
                <h3 className="font-bold text-[#6D28D9] dark:text-[#C4B5FD] flex items-center gap-2">
                  <Zap size={18} className="text-[#F59E0B]" />
                  Pro Tip
                </h3>
                <p className="text-[#1F2937] dark:text-[#E5E7EB] text-sm mt-1">
                  For best results, use images with good lighting and minimal
                  blur. Our AI works magic, but clearer inputs yield better
                  outputs!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      {activeTab === "url" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1F2937] rounded-2xl border-[3px] border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-6 text-center">
              Enter Image URL
            </h2>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-[3px] border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-lg bg-white dark:bg-[#374151] text-[#1F2937] dark:text-white placeholder-[#9CA3AF]"
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <LinkIcon className="w-5 h-5 text-[#6D28D9] dark:text-[#C4B5FD]" />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleUrlEnhancement}
                  disabled={isLoading || !imageUrl}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#6D28D9] hover:bg-[#5B21B6] transform hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                    isLoading || !imageUrl
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles size={18} />
                      <span>Enhance URL Image</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#E6F0FF] dark:bg-[#1A2A3A] rounded-2xl border-[3px] border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B] rounded-bl-full border-l-[3px] border-b-[3px] border-black"></div>

            <h2 className="text-2xl font-bold text-black dark:text-white mb-6 relative z-10">
              URL Enhancement
            </h2>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#6D28D9] rounded-full border-[3px] border-black flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-[#6D28D9] dark:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white">
                    Direct from the Web
                  </h3>
                  <p className="text-[#1F2937] dark:text-[#E5E7EB]">
                    Enhance images directly from any public URL without
                    downloading first
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#6D28D9] rounded-full border-[3px] border-black flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-[#6D28D9] dark:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white">
                    Supported Sources
                  </h3>
                  <p className="text-[#1F2937] dark:text-[#E5E7EB]">
                    Works with images from social media, cloud storage, and most
                    websites
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-[#1F2937] rounded-xl border-[3px] border-black relative z-10">
              <h3 className="font-bold text-[#6D28D9] dark:text-[#C4B5FD] flex items-center gap-2">
                <Info size={18} className="text-[#F59E0B]" />
                Important Note
              </h3>
              <p className="text-[#1F2937] dark:text-[#E5E7EB] text-sm mt-1">
                Make sure the URL points directly to an image file (ends with
                .jpg, .png, etc.) and is publicly accessible for best results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-8 p-4 bg-white dark:bg-[#1F2937] border-[3px] border-[#EF4444] rounded-xl animate-bounce-in shadow-[4px_4px_0_0_rgba(239,68,68,1)]">
          <p className="text-[#EF4444] font-bold flex items-center text-lg">
            <span className="inline-block w-6 h-6 bg-[#EF4444] text-white rounded-full mr-3 flex items-center justify-center font-bold">
              !
            </span>
            {error}
          </p>
        </div>
      )}
      {success && (
        <div className="mt-8 p-4 bg-white dark:bg-[#1F2937] border-[3px] border-[#10B981] rounded-xl animate-bounce-in shadow-[4px_4px_0_0_rgba(16,185,129,1)]">
          <p className="text-[#10B981] font-bold flex items-center text-lg">
            <span className="inline-block w-6 h-6 bg-[#10B981] text-white rounded-full mr-3 flex items-center justify-center font-bold">
              <Check size={14} />
            </span>
            {success}
          </p>
        </div>
      )}

      {/* Recent Enhancements Preview */}
      {enhancedImages.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <div className="inline-block bg-[#6D28D9] px-4 py-2 rounded-xl border-[3px] border-black transform rotate-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold text-white">
                Recent Enhancements
              </h2>
            </div>
            <button
              onClick={() => setActiveSection("gallery")}
              className="px-4 py-2 rounded-xl font-bold text-[#6D28D9] dark:text-white transition-all border-[3px] border-black bg-white dark:bg-[#1F2937] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none flex items-center gap-2"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {enhancedImages.slice(0, 4).map((img, index) => (
              <div
                key={img.id}
                className="rounded-xl overflow-hidden border-[3px] border-black transition-all duration-300 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 animate-card-in bg-white dark:bg-[#1F2937]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => showCompareModal(img)}
                >
                  <img
                    src={img.enhancedUrl || "/placeholder.svg"}
                    alt="Enhanced"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-0 right-0 bg-[#F59E0B] text-black font-bold px-2 py-1 border-b-[3px] border-l-[3px] border-black text-sm">
                    Enhanced
                  </div>
                </div>
                <div className="p-2 flex justify-between items-center">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent opening the modal
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
