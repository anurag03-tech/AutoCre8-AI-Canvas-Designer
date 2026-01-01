"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Trash2, X, UserPlus } from "lucide-react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logoUrl: string;
  tagline?: string;
  description?: string;
  industry?: string;
  keywords?: string[];
  values?: string[];
  mission?: string;
  vision?: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
  viewers?: Array<{
    _id: string;
    name: string;
    email: string;
    image: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const BrandDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddViewer, setShowAddViewer] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [addingViewer, setAddingViewer] = useState(false);

  useEffect(() => {
    if (brandId) {
      fetchBrandDetails();
    }
  }, [brandId]);

  const fetchBrandDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brand/${brandId}`);

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to load brand");
        router.push("/brand");
        return;
      }

      const data = await response.json();

      if (data.success && data.brand) {
        setBrand(data.brand);
        setIsOwner(data.isOwner || false);
      } else {
        alert("Brand not found");
        router.push("/brand");
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
      alert("An error occurred while loading the brand");
      router.push("/brand");
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
        alert(`${data.viewer.name} added successfully`);
        setViewerEmail("");
        setShowAddViewer(false);
        fetchBrandDetails();
      } else {
        alert(data.error || "Failed to add viewer");
      }
    } catch (error) {
      console.error("Error adding viewer:", error);
      alert("An error occurred");
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

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Viewer removed successfully");
        fetchBrandDetails();
      } else {
        alert(data.error || "Failed to remove viewer");
      }
    } catch (error) {
      console.error("Error removing viewer:", error);
      alert("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const response = await fetch(`/api/brand/${brandId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/brand");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Brand not found</p>
          <Button onClick={() => router.push("/brand")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brands
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => router.push("/brand")}
            variant="ghost"
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {isOwner && (
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/brand/${brandId}/edit`)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Brand Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
              {brand.tagline && (
                <p className="text-gray-600 mt-1">{brand.tagline}</p>
              )}
              {brand.industry && (
                <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm">
                  {brand.industry}
                </span>
              )}
            </div>
          </div>

          {brand.description && (
            <p className="text-gray-700 mt-4 pt-4 border-t">
              {brand.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {brand.mission && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
                <p className="text-gray-700">{brand.mission}</p>
              </div>
            )}

            {brand.vision && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Vision</h3>
                <p className="text-gray-700">{brand.vision}</p>
              </div>
            )}

            {brand.values && brand.values.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Values</h3>
                <div className="flex flex-wrap gap-2">
                  {brand.values.map((value, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {brand.keywords && brand.keywords.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {brand.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner */}
            {brand.owner && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">
                  {isOwner ? "Owner (You)" : "Owner"}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={brand.owner.image}
                      alt={brand.owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {brand.owner.name}
                    </p>
                    <p className="text-sm text-gray-500">{brand.owner.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Viewers */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500">
                    Shared With ({brand.viewers?.length || 0})
                  </h3>
                  <Button
                    onClick={() => setShowAddViewer(!showAddViewer)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {showAddViewer && (
                  <form onSubmit={handleAddViewer} className="mb-4 space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={viewerEmail}
                      onChange={(e) => setViewerEmail(e.target.value)}
                      disabled={addingViewer}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={addingViewer}
                        className="flex-1"
                      >
                        {addingViewer ? "Adding..." : "Add"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddViewer(false);
                          setViewerEmail("");
                        }}
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
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={viewer.image}
                            alt={viewer.name}
                            fill
                            className="object-cover"
                          />
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
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No viewers yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(brand.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDetailPage;
