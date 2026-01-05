"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/contexts/CanvasContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_KEY;

type MediaType = "photo" | "illustration" | "vector";

interface ImageKitImage {
  fileId: string;
  name: string;
  url: string;
  thumbnail?: string;
}

const ImagesPanel = () => {
  const { canvasActions, canvas } = useCanvas();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [images, setImages] = useState<ImageKitImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = canvas?.project?._id;

  useEffect(() => {
    if (projectId) {
      fetchProjectImages();
    }
  }, [projectId]);

  const fetchProjectImages = async () => {
    if (!projectId) return;

    setLoadingGallery(true);
    setGalleryError(null);

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
      setGalleryError(
        err instanceof Error ? err.message : "Failed to load images"
      );
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    if (!projectId) {
      alert("Project ID not found");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("projectId", projectId);

      const response = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && canvasActions) {
        canvasActions.addImage(result.data.url);
        await fetchProjectImages();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlAdd = async () => {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL");
      return;
    }
    try {
      new URL(imageUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    if (!projectId) {
      alert("Project ID not found");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch("/api/imagekit/proxy-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl,
          projectId: projectId,
          fileName: `url-${Date.now()}.jpg`,
        }),
      });

      const result = await response.json();

      if (result.success && canvasActions) {
        canvasActions.addImage(result.data.url);
        setImageUrl("");
        await fetchProjectImages();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUrlAdd();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Enter a search term");
      return;
    }
    if (!PIXABAY_API_KEY) {
      alert("Pixabay API key is not configured");
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        key: PIXABAY_API_KEY,
        q: searchQuery,
        image_type: mediaType,
        per_page: "20",
        safesearch: "true",
      });

      const res = await fetch(`https://pixabay.com/api/?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Pixabay request failed: ${res.status}`);
      }
      const data = await res.json();
      setSearchResults(data.hits || []);
    } catch (err) {
      console.error(err);
      setSearchError("Failed to fetch images. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAddFromPixabay = async (url: string) => {
    if (!projectId) {
      alert("Project ID not found");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch("/api/imagekit/proxy-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: url,
          projectId: projectId,
          fileName: `pixabay-${Date.now()}.jpg`,
        }),
      });

      const result = await response.json();

      if (result.success && canvasActions) {
        canvasActions.addImage(result.data.url);
        await fetchProjectImages();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCanvas = (url: string) => {
    if (canvasActions) {
      canvasActions.addImage(url);
    }
  };

  const handleDeleteImage = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeletingId(fileId);

    try {
      const response = await fetch(`/api/imagekit/delete/${fileId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchProjectImages();
      } else {
        throw new Error(result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* GALLERY TAB */}
        <TabsContent
          value="gallery"
          className="flex-1 space-y-4 mt-4 overflow-y-auto"
        >
          {/* Upload Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
              Upload Image
            </h4>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              className="w-full h-10 flex flex-row items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Upload from Device</span>
                </>
              )}
            </Button>

            {/* Add by URL */}
            <div className="flex gap-2">
              <Input
                placeholder="Or paste image URL"
                className="flex-1 h-9"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleUrlKeyPress}
                disabled={uploading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleUrlAdd}
                disabled={uploading}
                className="h-9"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Project Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-blue-600 uppercase">
                Project Gallery ({images.length})
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchProjectImages}
                disabled={loadingGallery}
                className="h-7"
              >
                <RefreshCw
                  className={`w-3 h-3 ${loadingGallery ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {loadingGallery ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : galleryError ? (
              <div className="flex items-center justify-center h-32 text-sm text-red-500">
                {galleryError}
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">No images uploaded yet</p>
                <p className="text-xs text-gray-400">Upload to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img) => (
                  <div
                    key={img.fileId}
                    className="relative h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors group"
                  >
                    <img
                      src={img.thumbnail || img.url}
                      alt={img.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleAddToCanvas(img.url)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        onClick={() => handleAddToCanvas(img.url)}
                        title="Add to canvas"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        className="p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.fileId);
                        }}
                        disabled={deletingId === img.fileId}
                        title="Delete"
                      >
                        {deletingId === img.fileId ? (
                          <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2">
              All images support transformations
            </p>
          </div>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent
          value="search"
          className="flex-1 space-y-4 mt-4 overflow-y-auto"
        >
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Search Stock Images (Pixabay)
            </h4>

            {/* Media type toggle */}
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={mediaType === "photo" ? "default" : "outline"}
                className="text-xs flex-1"
                onClick={() => setMediaType("photo")}
              >
                Photos
              </Button>
              <Button
                size="sm"
                variant={mediaType === "illustration" ? "default" : "outline"}
                className="text-xs flex-1"
                onClick={() => setMediaType("illustration")}
              >
                Illustrations
              </Button>
              <Button
                size="sm"
                variant={mediaType === "vector" ? "default" : "outline"}
                className="text-xs flex-1"
                onClick={() => setMediaType("vector")}
              >
                Vectors
              </Button>
            </div>

            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Search for images..."
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
                onClick={handleSearch}
                disabled={searching || uploading}
              >
                <Search className="w-4 h-4 text-white" />
              </Button>
            </div>

            {searchError && (
              <p className="text-xs text-red-500 mb-2">{searchError}</p>
            )}
            {searching && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Searching images...</span>
              </div>
            )}
            {uploading && (
              <div className="flex items-center gap-2 text-xs text-blue-500 mb-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Adding to gallery...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {searchResults.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  className="relative h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-500 transition-colors group"
                  onClick={() => handleAddFromPixabay(hit.largeImageURL)}
                  disabled={uploading}
                >
                  <img
                    src={hit.previewURL}
                    alt={hit.tags}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
              {!searching && searchResults.length === 0 && !searchError && (
                <p className="text-xs text-gray-400 col-span-2 text-center py-8">
                  Search Pixabay to find images
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagesPanel;
