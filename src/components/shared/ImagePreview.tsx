"use client";

import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onClose?: () => void;
}

export default function ImagePreview({ src, alt, onClose }: ImagePreviewProps) {
  return (
    <div className="relative inline-block">
      <img src={src} alt={alt ?? "Preview"} className="max-h-48 rounded-lg border border-border" />
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
