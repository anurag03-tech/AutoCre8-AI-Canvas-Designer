"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Edit,
  Trash2,
  X,
  UserPlus,
  Sparkles,
  Palette,
  Type,
  Image as ImageIcon,
  FileText,
  Lightbulb,
  CheckCircle,
  XCircle,
  Ruler,
  Tag,
} from "lucide-react";
import Image from "next/image";

interface BrandGuidelines {
  logoDescription?: string;
  logoColors?: string[];
  logoStyle?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string[];
    neutral?: string[];
    gradients?: string[];
  };
  fonts?: {
    heading?: string;
    body?: string;
    suggested?: string[];
  };
  personality?: string[];
  style?: string;
  mood?: string[];
  visualElements?: string[];
  designDos?: string[];
  designDonts?: string[];
  spacing?: {
    baseUnit?: string;
    scale?: number[];
  };
  borderRadius?: string[];
  suggestedTagline?: string;
  enhancedDescription?: string;
  suggestedKeywords?: string[];
  brandValues?: string[];
  suggestedMission?: string;
  suggestedVision?: string;
  generatedAt?: string;
}

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
  guidelines?: BrandGuidelines;
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
  const [generatingGuidelines, setGeneratingGuidelines] = useState(false);

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

  const handleGenerateGuidelines = async () => {
    if (
      !confirm("Generate AI-powered brand guidelines? This may take a moment.")
    )
      return;

    setGeneratingGuidelines(true);
    try {
      const response = await fetch(`/api/brand/generate-guidelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Guidelines generated successfully!");
        fetchBrandDetails();
      } else {
        alert(data.error || "Failed to generate guidelines");
      }
    } catch (error) {
      console.error("Error generating guidelines:", error);
      alert("An error occurred");
    } finally {
      setGeneratingGuidelines(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Brand not found</p>
          <Button
            onClick={() => router.push("/brand")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brands
          </Button>
        </div>
      </div>
    );
  }

  const guidelines = brand.guidelines;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            onClick={() => router.push("/brand")}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brands
          </Button>

          {isOwner && (
            <div className="flex gap-2">
              {!guidelines && (
                <Button
                  onClick={handleGenerateGuidelines}
                  disabled={generatingGuidelines}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generatingGuidelines
                    ? "Generating..."
                    : "Generate Guidelines"}
                </Button>
              )}
              <Button
                onClick={() => router.push(`/brand/${brandId}/edit`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

        {/* Brand Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative w-24 h-24 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 p-2">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {brand.name}
              </h1>
              {brand.tagline && (
                <p className="text-xl text-gray-600 mb-4">{brand.tagline}</p>
              )}
              {brand.industry && (
                <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg text-sm font-medium">
                  {brand.industry}
                </span>
              )}
            </div>
          </div>

          {brand.description && (
            <p className="text-gray-700 mt-6 pt-6 border-t border-gray-200 leading-relaxed">
              {brand.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* AI-Generated Brand Guidelines */}
            {guidelines && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      AI-Generated Brand Guidelines
                    </h2>
                  </div>
                  {guidelines.generatedAt && (
                    <span className="text-xs text-gray-500">
                      Generated{" "}
                      {new Date(guidelines.generatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Logo Guidelines */}
                  {(guidelines.logoDescription ||
                    guidelines.logoStyle ||
                    guidelines.logoColors) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Logo Guidelines
                        </h3>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                        {guidelines.logoDescription && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Description
                            </p>
                            <p className="text-gray-900">
                              {guidelines.logoDescription}
                            </p>
                          </div>
                        )}
                        {guidelines.logoStyle && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Style</p>
                            <p className="text-gray-900">
                              {guidelines.logoStyle}
                            </p>
                          </div>
                        )}
                        {guidelines.logoColors &&
                          guidelines.logoColors.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Logo Colors
                              </p>
                              <div className="flex gap-2">
                                {guidelines.logoColors.map((color, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col items-center gap-2"
                                  >
                                    <div
                                      className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-gray-600 font-mono">
                                      {color}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Color Palette */}
                  {guidelines.colors && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-5 h-5 text-pink-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Color Palette
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {guidelines.colors.primary && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Primary Color
                            </p>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-20 h-20 rounded-lg border-2 border-gray-300 shadow-sm"
                                style={{
                                  backgroundColor: guidelines.colors.primary,
                                }}
                              />
                              <span className="text-sm text-gray-700 font-mono">
                                {guidelines.colors.primary}
                              </span>
                            </div>
                          </div>
                        )}

                        {guidelines.colors.secondary && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Secondary Color
                            </p>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-20 h-20 rounded-lg border-2 border-gray-300 shadow-sm"
                                style={{
                                  backgroundColor: guidelines.colors.secondary,
                                }}
                              />
                              <span className="text-sm text-gray-700 font-mono">
                                {guidelines.colors.secondary}
                              </span>
                            </div>
                          </div>
                        )}

                        {guidelines.colors.accent &&
                          guidelines.colors.accent.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Accent Colors
                              </p>
                              <div className="flex gap-2">
                                {guidelines.colors.accent.map((color, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col items-center gap-2"
                                  >
                                    <div
                                      className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-gray-600 font-mono">
                                      {color}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {guidelines.colors.neutral &&
                          guidelines.colors.neutral.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Neutral Colors
                              </p>
                              <div className="flex gap-2">
                                {guidelines.colors.neutral.map((color, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col items-center gap-2"
                                  >
                                    <div
                                      className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-gray-600 font-mono">
                                      {color}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {guidelines.colors.gradients &&
                          guidelines.colors.gradients.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Suggested Gradients
                              </p>
                              <div className="flex gap-2">
                                {guidelines.colors.gradients.map((color, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col items-center gap-2"
                                  >
                                    <div
                                      className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-gray-600 font-mono">
                                      {color}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Typography */}
                  {guidelines.fonts && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Type className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Typography
                        </h3>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                        {guidelines.fonts.heading && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Heading Font
                            </p>
                            <p
                              className="text-2xl text-gray-900 font-semibold"
                              style={{ fontFamily: guidelines.fonts.heading }}
                            >
                              {guidelines.fonts.heading}
                            </p>
                          </div>
                        )}
                        {guidelines.fonts.body && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Body Font
                            </p>
                            <p
                              className="text-lg text-gray-900"
                              style={{ fontFamily: guidelines.fonts.body }}
                            >
                              {guidelines.fonts.body}
                            </p>
                          </div>
                        )}
                        {guidelines.fonts.suggested &&
                          guidelines.fonts.suggested.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Suggested Alternatives
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {guidelines.fonts.suggested.map((font, i) => (
                                  <span
                                    key={i}
                                    className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm"
                                    style={{ fontFamily: font }}
                                  >
                                    {font}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Brand Personality & Mood */}
                  {(guidelines.personality ||
                    guidelines.mood ||
                    guidelines.style) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Brand Personality
                        </h3>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                        {guidelines.style && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Style</p>
                            <p className="text-gray-900">{guidelines.style}</p>
                          </div>
                        )}
                        {guidelines.personality &&
                          guidelines.personality.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Personality Traits
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {guidelines.personality.map((trait, i) => (
                                  <span
                                    key={i}
                                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200"
                                  >
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {guidelines.mood && guidelines.mood.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Mood</p>
                            <div className="flex flex-wrap gap-2">
                              {guidelines.mood.map((m, i) => (
                                <span
                                  key={i}
                                  className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Visual Elements */}
                  {guidelines.visualElements &&
                    guidelines.visualElements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-cyan-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Visual Elements
                          </h3>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                          <ul className="space-y-2">
                            {guidelines.visualElements.map((element, i) => (
                              <li
                                key={i}
                                className="text-gray-700 flex items-start"
                              >
                                <span className="text-cyan-600 mr-2">•</span>
                                {element}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Design Do's & Don'ts */}
                  {(guidelines.designDos || guidelines.designDonts) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {guidelines.designDos &&
                        guidelines.designDos.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                Design Do's
                              </h3>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                              <ul className="space-y-2">
                                {guidelines.designDos.map((d, i) => (
                                  <li
                                    key={i}
                                    className="text-green-800 text-sm flex items-start"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                      {guidelines.designDonts &&
                        guidelines.designDonts.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                Design Don'ts
                              </h3>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                              <ul className="space-y-2">
                                {guidelines.designDonts.map((d, i) => (
                                  <li
                                    key={i}
                                    className="text-red-800 text-sm flex items-start"
                                  >
                                    <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Spacing & Layout */}
                  {(guidelines.spacing || guidelines.borderRadius) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Ruler className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Spacing & Layout
                        </h3>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                        {guidelines.spacing && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Base Unit: {guidelines.spacing.baseUnit}
                            </p>
                            {guidelines.spacing.scale && (
                              <div className="flex gap-2">
                                {guidelines.spacing.scale.map((s, i) => (
                                  <span
                                    key={i}
                                    className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-mono"
                                  >
                                    {s}x
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {guidelines.borderRadius && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Border Radius
                            </p>
                            <div className="flex gap-2">
                              {guidelines.borderRadius.map((r, i) => (
                                <span
                                  key={i}
                                  className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {(guidelines.suggestedTagline ||
                    guidelines.enhancedDescription ||
                    guidelines.suggestedKeywords ||
                    guidelines.brandValues ||
                    guidelines.suggestedMission ||
                    guidelines.suggestedVision) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          AI Suggestions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {guidelines.suggestedTagline && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">
                              Suggested Tagline
                            </p>
                            <p className="text-lg text-gray-900 italic">
                              "{guidelines.suggestedTagline}"
                            </p>
                          </div>
                        )}

                        {guidelines.enhancedDescription && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">
                              Enhanced Description
                            </p>
                            <p className="text-gray-900">
                              {guidelines.enhancedDescription}
                            </p>
                          </div>
                        )}

                        {guidelines.suggestedMission && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">
                              Suggested Mission
                            </p>
                            <p className="text-gray-900">
                              {guidelines.suggestedMission}
                            </p>
                          </div>
                        )}

                        {guidelines.suggestedVision && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">
                              Suggested Vision
                            </p>
                            <p className="text-gray-900">
                              {guidelines.suggestedVision}
                            </p>
                          </div>
                        )}

                        {guidelines.suggestedKeywords &&
                          guidelines.suggestedKeywords.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                              <p className="text-sm text-gray-500 mb-3">
                                Suggested Keywords
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {guidelines.suggestedKeywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm border border-indigo-200"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {guidelines.brandValues &&
                          guidelines.brandValues.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                              <p className="text-sm text-gray-500 mb-3">
                                Suggested Brand Values
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {guidelines.brandValues.map((val, i) => (
                                  <span
                                    key={i}
                                    className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200"
                                  >
                                    {val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-6">
              {brand.mission && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Mission</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {brand.mission}
                  </p>
                </div>
              )}

              {brand.vision && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {brand.vision}
                  </p>
                </div>
              )}
            </div>

            {/* Values */}
            {brand.values && brand.values.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Brand Values
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brand.values.map((value, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {brand.keywords && brand.keywords.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {brand.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200"
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
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-4">
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
                    <p className="font-medium text-gray-900 text-sm">
                      {brand.owner.name}
                    </p>
                    <p className="text-xs text-gray-500">{brand.owner.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Viewers */}
            {isOwner && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase">
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
                      placeholder="Enter email"
                      value={viewerEmail}
                      onChange={(e) => setViewerEmail(e.target.value)}
                      disabled={addingViewer}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={addingViewer}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-4">
                Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(brand.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(brand.updatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
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
