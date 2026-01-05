"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

const BrandEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  useEffect(() => {
    if (brandId) fetchBrand();
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      const res = await fetch(`/api/brand/${brandId}`);
      const data = await res.json();
      if (data.success && data.brand) {
        setFormData({
          name: data.brand.name || "",
          logoUrl: data.brand.logoUrl || "",
          tagline: data.brand.tagline || "",
          description: data.brand.description || "",
          brandIdentity: data.brand.brandIdentity || "",
          fontType: data.brand.fontType || "",
          colorTheme: data.brand.colorTheme || "",
          backgroundImageUrl: data.brand.backgroundImageUrl || "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/brand/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/brand/${brandId}`);
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (error) {
      alert("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return <div className="p-8 text-center">Loading brand data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
          <Button
            variant="ghost"
            onClick={() => router.push(`/brand/${brandId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tagline
              </label>
              <Input
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About / Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="border-t border-gray-100 my-6 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visual Identity & Preferences
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Style / Identity
                </label>
                <Textarea
                  value={formData.brandIdentity}
                  onChange={(e) =>
                    setFormData({ ...formData, brandIdentity: e.target.value })
                  }
                  placeholder="e.g. Professional, Clean, Minimalist"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Font Preferences
                </label>
                <Textarea
                  value={formData.fontType}
                  onChange={(e) =>
                    setFormData({ ...formData, fontType: e.target.value })
                  }
                  placeholder="Describe your font preferences in natural language..."
                  rows={4}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color Theme
                </label>
                <Textarea
                  value={formData.colorTheme}
                  onChange={(e) =>
                    setFormData({ ...formData, colorTheme: e.target.value })
                  }
                  placeholder="Describe your color preferences..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fixed Background Image URL
                </label>
                <Input
                  value={formData.backgroundImageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      backgroundImageUrl: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste a direct image link (optional)
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo URL
            </label>
            <Input
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg"
              disabled={loading}
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandEditPage;
