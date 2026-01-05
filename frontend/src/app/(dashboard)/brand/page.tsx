"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Users, Trash2, Edit } from "lucide-react";

interface Brand {
  _id: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;
  owner?: {
    _id: string;
    name: string;
    image: string;
  };
  updatedAt: string;
}

const BrandPage = () => {
  const router = useRouter();
  const [ownedBrands, setOwnedBrands] = useState<Brand[]>([]);
  const [sharedBrands, setSharedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/brand/my-brands");
      const data = await response.json();

      if (data.success) {
        setOwnedBrands(data.ownedBrands);
        setSharedBrands(data.sharedBrands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const response = await fetch(`/api/brand/${brandId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOwnedBrands(ownedBrands.filter((b) => b._id !== brandId));
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Brands</h1>
            <p className="text-gray-600 mt-1">
              Manage your brand identities and assets
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Brand
          </Button>
        </div>

        {/* Owned Brands Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              My Brands ({ownedBrands.length})
            </h2>
          </div>

          {ownedBrands.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No brands yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first brand to get started
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Brand
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedBrands.map((brand) => (
                <BrandCard
                  key={brand._id}
                  brand={brand}
                  isOwner={true}
                  onDelete={() => handleDeleteBrand(brand._id)}
                  onEdit={() => router.push(`/brand/${brand._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shared Brands Section (RESTORED) */}
        {sharedBrands.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Shared with Me ({sharedBrands.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedBrands.map((brand) => (
                <BrandCard
                  key={brand._id}
                  brand={brand}
                  isOwner={false}
                  onEdit={() => router.push(`/brand/${brand._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Brand Modal */}
      {showCreateModal && (
        <CreateBrandModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBrands();
          }}
        />
      )}
    </div>
  );
};

// Brand Card Component
const BrandCard = ({
  brand,
  isOwner,
  onDelete,
  onEdit,
}: {
  brand: Brand;
  isOwner: boolean;
  onDelete?: () => void;
  onEdit: () => void;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group flex flex-col h-full">
      {/* Logo Section */}
      <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative border-b border-gray-100">
        <div className="relative w-24 h-24 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Building2 className="w-10 h-10 text-gray-300" />
          )}
        </div>
        {!isOwner && brand.owner && (
          <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {brand.owner.name}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
          {brand.tagline || "No tagline set"}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <Button
            onClick={onEdit}
            className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
            variant="ghost"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isOwner ? "Manage" : "View Details"}
          </Button>

          {isOwner && onDelete && (
            <Button
              onClick={onDelete}
              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 px-3"
              variant="ghost"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Updated Create Brand Modal with TextAreas
const CreateBrandModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    tagline: "",
    description: "",
    brandIdentity: "",
    fontType: "",
    colorTheme: "",
    backgroundImageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/brand/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || "Failed to create brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      alert("Failed to create brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Brand</h2>
          <p className="text-gray-500 text-sm mt-1">
            Define your brand identity to streamline your designs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="AutoCre8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <Input
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="Design for everyone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What does the brand do? (About)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="We are a tech company specializing in AI..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Identity
              </label>
              <Textarea
                value={formData.brandIdentity}
                onChange={(e) =>
                  setFormData({ ...formData, brandIdentity: e.target.value })
                }
                placeholder="e.g. Modern, Minimalist, Professional..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Preferences
              </label>
              <Textarea
                value={formData.fontType}
                onChange={(e) =>
                  setFormData({ ...formData, fontType: e.target.value })
                }
                placeholder="e.g. Sans-Serif fonts like Inter, Bold headings..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Theme
              </label>
              <Textarea
                value={formData.colorTheme}
                onChange={(e) =>
                  setFormData({ ...formData, colorTheme: e.target.value })
                }
                placeholder="e.g. Dark mode primarily, using Neon Blue for accents..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Background URL
              </label>
              <Input
                value={formData.backgroundImageUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    backgroundImageUrl: e.target.value,
                  })
                }
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional fixed background image
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <Input
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Brand"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandPage;
