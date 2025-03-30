"use client";

import { useState, useEffect } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import EnhanceSection from "./components/enhance-section";
import GallerySection from "./components/gallery-section";
import InfoModal from "./components/modals/info-modal";
import ResultModal from "./components/modals/result-modal";
import DeleteConfirmModal from "./components/modals/delete-confirm-modal";
import DeleteAllConfirmModal from "./components/modals/delete-all-confirm-modal";
import FloatingElements from "./components/floating-elements";
import type { EnhancedImage } from "./types";

export default function Page() {
  const [activeSection, setActiveSection] = useState<"enhance" | "gallery">(
    "enhance"
  );
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContentVisible, setModalContentVisible] =
    useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<EnhancedImage | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] =
    useState<boolean>(false);
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([]);

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

  const toggleInfo = () => setShowInfo(!showInfo);

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

  const showCompareModal = (image: EnhancedImage) => {
    setCurrentResult(image);
    showModal();
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const deleteImage = (id: string) => {
    setEnhancedImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteConfirmId(null);
  };

  const confirmDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const cancelDeleteAll = () => {
    setShowDeleteAllConfirm(false);
  };

  const deleteAllImages = () => {
    setEnhancedImages([]);
    setShowDeleteAllConfirm(false);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      // Fetch the image from the URL
      const response = await fetch(url);

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a local URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the blob URL to free memory
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="relative  min-h-screen flex flex-col bg-[#E6F7FF] dark:bg-[#0A1A2A] transition-colors duration-300">
      <FloatingElements />

      {/* Diagonal Pattern Overlay */}
      <div className="absolute top-0 left-0 w-full h-full  z-0 opacity-20 pointer-events-none">
        <div
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          toggleInfo={toggleInfo}
        />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar">
          {activeSection === "enhance" ? (
            <EnhanceSection
              enhancedImages={enhancedImages}
              setEnhancedImages={setEnhancedImages}
              showCompareModal={showCompareModal}
              deleteImage={deleteImage}
              confirmDelete={confirmDelete}
              setActiveSection={setActiveSection}
              downloadImage={downloadImage}
            />
          ) : (
            <GallerySection
              enhancedImages={enhancedImages}
              showCompareModal={showCompareModal}
              confirmDelete={confirmDelete}
              confirmDeleteAll={confirmDeleteAll}
              downloadImage={downloadImage}
            />
          )}
        </main>

        <Footer />

        {/* Modals */}
        {modalVisible && (
          <ResultModal
            visible={modalVisible}
            contentVisible={modalContentVisible}
            currentResult={currentResult}
            closeModal={closeModal}
            downloadImage={downloadImage}
          />
        )}

        {deleteConfirmId && (
          <DeleteConfirmModal
            cancelDelete={cancelDelete}
            confirmDelete={() => deleteImage(deleteConfirmId)}
          />
        )}

        {showDeleteAllConfirm && (
          <DeleteAllConfirmModal
            cancelDelete={cancelDeleteAll}
            confirmDelete={deleteAllImages}
          />
        )}

        {showInfo && <InfoModal toggleInfo={toggleInfo} />}
      </div>
    </div>
  );
}
