"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X } from "lucide-react";

interface BrandFormData {
  name: string;
  logoUrl: string;
  tagline: string;
  description: string;
  industry: string;
  keywords: string[];
  values: string[];
  mission: string;
  vision: string;
}

const BrandEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    logoUrl: "",
    tagline: "",
    description: "",
    industry: "",
    keywords: [],
    values: [],
    mission: "",
    vision: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  useEffect(() => {
    fetchBrand();
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brand/${brandId}`);

      if (!response.ok) {
        alert("Failed to load brand");
        router.push("/brand");
        return;
      }

      const data = await response.json();

      if (data.success && data.brand) {
        if (!data.isOwner) {
          alert("Only the owner can edit this brand");
          router.push(`/brand/${brandId}`);
          return;
        }

        setFormData({
          name: data.brand.name || "",
          logoUrl: data.brand.logoUrl || "",
          tagline: data.brand.tagline || "",
          description: data.brand.description || "",
          industry: data.brand.industry || "",
          keywords: data.brand.keywords || [],
          values: data.brand.values || [],
          mission: data.brand.mission || "",
          vision: data.brand.vision || "",
        });
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
      alert("An error occurred");
      router.push("/brand");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.logoUrl.trim()) {
      alert("Name and Logo URL are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/brand/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Brand updated successfully");
        router.push(`/brand/${brandId}`);
      } else {
        alert(data.error || "Failed to update brand");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, i) => i !== index),
    });
  };

  const addValue = () => {
    if (valueInput.trim() && !formData.values.includes(valueInput.trim())) {
      setFormData({
        ...formData,
        values: [...formData.values, valueInput.trim()],
      });
      setValueInput("");
    }
  };

  const removeValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => router.push(`/brand/${brandId}`)}
            variant="ghost"
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Brand</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter brand name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL *
              </label>
              <Input
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <Input
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="Brief tagline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <Input
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., Technology, Fashion, Food"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your brand"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission
              </label>
              <Textarea
                value={formData.mission}
                onChange={(e) =>
                  setFormData({ ...formData, mission: e.target.value })
                }
                placeholder="What is your brand's mission?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision
              </label>
              <Textarea
                value={formData.vision}
                onChange={(e) =>
                  setFormData({ ...formData, vision: e.target.value })
                }
                placeholder="What is your brand's vision?"
                rows={3}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addKeyword())
                  }
                  placeholder="Add keyword"
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Core Values
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addValue())
                  }
                  placeholder="Add value"
                />
                <Button type="button" onClick={addValue} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.values.map((value, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/brand/${brandId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandEditPage;
