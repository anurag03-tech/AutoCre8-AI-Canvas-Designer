"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Users, Trash2, Edit } from "lucide-react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logoUrl: string;
  tagline?: string;
  description?: string;
  industry?: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
  viewers?: any[];
  createdAt: string;
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
              Manage your brand identities and guidelines
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

        {/* Owned Brands */}
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
                Create your first brand to get started with AI-powered design
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

        {/* Shared Brands */}
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
      {/* Logo Section */}
      <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md">
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            fill
            className="object-cover"
          />
        </div>
        {!isOwner && brand.owner && (
          <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            Shared by {brand.owner.name}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.name}</h3>
        {brand.tagline && (
          <p className="text-sm text-gray-600 mb-3">{brand.tagline}</p>
        )}
        {brand.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {brand.description}
          </p>
        )}

        {brand.industry && (
          <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            {brand.industry}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <Button
            onClick={onEdit}
            className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isOwner ? "Manage" : "View"}
          </Button>

          {isOwner && (
            <>
              <Button
                onClick={onDelete}
                className="bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 text-xs text-gray-400">
          Updated {new Date(brand.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Create Brand Modal Component
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
    industry: "",
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Brand</h2>
          <p className="text-gray-600 mt-1">
            Add your brand details to generate AI-powered guidelines
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="AutoCre8"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Logo URL *
            </label>
            <input
              type="url"
              required
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Design with AI"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Tell us about your brand..."
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Fashion">Fashion</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
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
