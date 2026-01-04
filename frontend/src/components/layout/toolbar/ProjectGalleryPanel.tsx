"use client";

import React, { useState, useEffect } from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import { Loader2, ImageIcon } from "lucide-react";

interface ImageKitImage {
  fileId: string;
  name: string;
  url: string;
  thumbnail?: string;
}

const ProjectGalleryPanel = () => {
  const { canvas, canvasActions } = useCanvas();
  const [images, setImages] = useState<ImageKitImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = canvas?.project?._id;

  useEffect(() => {
    if (projectId) {
      fetchProjectImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjectImages = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/imagekit/list/${projectId}`);
      const result = await response.json();

      if (result.success) {
        setImages(result.images);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    canvasActions?.addImage(imageUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-s font-semibold text-blue-600 uppercase mb-3">
          Project Gallery ({images.length})
        </h4>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {images.map((img) => (
              <button
                key={img.fileId}
                type="button"
                className="relative h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors group"
                onClick={() => handleImageClick(img.url)}
              >
                <img
                  src={img.thumbnail || img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-2">
          All images support transformations
        </p>
      </div>
    </div>
  );
};

export default ProjectGalleryPanel;
