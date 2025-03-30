"use client";

interface DeleteConfirmModalProps {
  cancelDelete: () => void;
  confirmDelete: () => void;
}

export default function DeleteConfirmModal({
  cancelDelete,
  confirmDelete,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border-[3px] border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
          Confirm Delete
        </h2>
        <p className="text-[#4B5563] dark:text-[#D1D5DB] mb-6">
          Are you sure you want to delete this image? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={cancelDelete}
            className="px-4 py-2 rounded-xl font-bold text-[#1F2937] dark:text-white transition-all border-[3px] border-black bg-white dark:bg-[#374151] hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-xl font-bold text-white transition-all border-[3px] border-black bg-[#EF4444] hover:bg-[#DC2626] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
