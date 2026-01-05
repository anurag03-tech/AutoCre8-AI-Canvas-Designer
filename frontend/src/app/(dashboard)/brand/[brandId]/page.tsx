"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Trash2, UserPlus, X } from "lucide-react";

interface Brand {
  _id: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;

  // Visual Identity
  brandIdentity?: string;
  fontType?: string;
  colorTheme?: string;
  backgroundImageUrl?: string;

  // Team
  owner?: { _id: string; name: string; email: string; image: string };
  viewers?: Array<{ _id: string; name: string; email: string; image: string }>;
}

const BrandDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Viewer Management State
  const [showAddViewer, setShowAddViewer] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [addingViewer, setAddingViewer] = useState(false);

  useEffect(() => {
    if (brandId) fetchBrandDetails();
  }, [brandId]);

  const fetchBrandDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brand/${brandId}`);
      const data = await response.json();

      if (data.success && data.brand) {
        setBrand(data.brand);
        setIsOwner(data.isOwner || false);
      } else {
        router.push("/brand");
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddViewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerEmail.trim()) return;

    setAddingViewer(true);
    try {
      const response = await fetch(`/api/brand/${brandId}/add-viewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: viewerEmail.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setViewerEmail("");
        setShowAddViewer(false);
        fetchBrandDetails(); // Refresh list
      } else {
        alert(data.error || "Failed to add viewer");
      }
    } catch (error) {
      alert("Error adding viewer");
    } finally {
      setAddingViewer(false);
    }
  };

  const handleRemoveViewer = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from viewers?`)) return;

    try {
      const response = await fetch(`/api/brand/${brandId}/remove-viewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchBrandDetails();
      } else {
        alert("Failed to remove viewer");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/brand")}
            className="text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Brands
          </Button>
          {isOwner && (
            <Button
              onClick={() => router.push(`/brand/${brandId}/edit`)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Brand
            </Button>
          )}
        </div>

        {/* Brand Header Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-xs">No Logo</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {brand.name}
              </h1>
              {brand.tagline && (
                <p className="text-xl text-gray-500">{brand.tagline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Brand Details (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-xs mb-4">
                About the Brand
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {brand.description || "No description provided."}
              </p>
            </div>

            {/* Visual Identity */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-xs mb-6">
                Visual Identity
              </h3>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Brand Personality
                  </span>
                  <p className="text-gray-900 whitespace-pre-wrap text-sm font-medium">
                    {brand.brandIdentity || "Not specified"}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Typography
                    </span>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm font-medium">
                      {brand.fontType || "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Color Theme
                    </span>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm font-medium">
                      {brand.colorTheme || "Not specified"}
                    </p>
                  </div>
                </div>

                {brand.backgroundImageUrl && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Fixed Background
                    </span>
                    <div className="h-48 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                      <img
                        src={brand.backgroundImageUrl}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Team & Meta (Spans 1 column) */}
          <div className="space-y-6">
            {/* Owner Card */}
            {brand.owner && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-4">
                  Owner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                    {brand.owner.image ? (
                      <img
                        src={brand.owner.image}
                        alt={brand.owner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      brand.owner.name[0]
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {brand.owner.name}
                    </p>
                    <p className="text-xs text-gray-500">{brand.owner.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Viewers / Team Card */}
            {isOwner && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase">
                    Team Access ({brand.viewers?.length || 0})
                  </h3>
                  <Button
                    onClick={() => setShowAddViewer(!showAddViewer)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {showAddViewer && (
                  <form
                    onSubmit={handleAddViewer}
                    className="mb-4 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <Input
                      type="email"
                      placeholder="colleague@email.com"
                      value={viewerEmail}
                      onChange={(e) => setViewerEmail(e.target.value)}
                      disabled={addingViewer}
                      className="bg-white text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={addingViewer}
                        className="flex-1 bg-indigo-600 h-8 text-xs"
                      >
                        {addingViewer ? "Adding..." : "Add"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddViewer(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {brand.viewers && brand.viewers.length > 0 ? (
                    brand.viewers.map((viewer) => (
                      <div
                        key={viewer._id}
                        className="flex items-center gap-3 group p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold overflow-hidden text-xs">
                          {viewer.image ? (
                            <img
                              src={viewer.image}
                              alt={viewer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            viewer.name[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {viewer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {viewer.email}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveViewer(viewer._id, viewer.name)
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded transition-all"
                          title="Remove user"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-2">
                      No members added yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDetailPage;
