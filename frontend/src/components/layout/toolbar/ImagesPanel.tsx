"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/contexts/CanvasContext";

const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_KEY;

type MediaType = "photo" | "illustration" | "vector";

const ImagesPanel = () => {
  const { canvasActions, canvas } = useCanvas(); // Get canvas for projectId
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = canvas?.project?._id;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  //  Upload local file to ImageKit first
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
        // Add ImageKit URL to canvas (transformations will work)
        canvasActions.addImage(result.data.url);
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

  // Upload URL image to ImageKit first
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
    setError(null);

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
      setResults(data.hits || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch images. Please try again.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Upload Pixabay image to ImageKit first
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

  return (
    <div className="space-y-4">
      {/* Upload from device */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Add Image
        </h4>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">
            {uploading ? "Uploading..." : "Upload Image"}
          </span>
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Supports JPG, PNG, GIF, WebP (max 10MB)
        </p>
      </div>

      {/* Add by URL */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Or Add by URL
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            className="flex-1"
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
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pixabay Search */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Search Stock Images (Pixabay)
        </h4>

        {/* Media type toggle */}
        <div className="flex gap-2 mb-2">
          <Button
            size="sm"
            variant={mediaType === "photo" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setMediaType("photo")}
          >
            Photos
          </Button>
          <Button
            size="sm"
            variant={mediaType === "illustration" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setMediaType("illustration")}
          >
            Illustrations
          </Button>
          <Button
            size="sm"
            variant={mediaType === "vector" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setMediaType("vector")}
          >
            Vectors
          </Button>
        </div>

        <div className="flex gap-2 mb-2">
          <Input
            placeholder="e.g. neon background"
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSearch}
            disabled={searching || uploading}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {searching && (
          <p className="text-xs text-gray-500 mb-2">Searching images…</p>
        )}
        {uploading && (
          <p className="text-xs text-blue-500 mb-2">Uploading to ImageKit...</p>
        )}

        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
          {results.map((hit) => (
            <button
              key={hit.id}
              type="button"
              className="relative h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-500 transition-colors group"
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
          {!searching && results.length === 0 && !error && (
            <p className="text-xs text-gray-400 col-span-2">
              Search Pixabay to see images.
            </p>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Images uploaded to ImageKit for transformations
        </p>
      </div>
    </div>
  );
};

export default ImagesPanel;
