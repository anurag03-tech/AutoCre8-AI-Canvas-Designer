"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Trash2,
  UserPlus,
  X,
  Plus,
  FileText,
  Calendar,
  Ruler,
  Search,
} from "lucide-react";
import Image from "next/image";
import { CANVAS_TEMPLATES } from "@/lib/constants";

interface BrandMember {
  _id: string;
  name: string;
  email: string;
  image: string;
}

interface Canvas {
  _id: string;
  name: string;
  description?: string;
  template: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  brand?: {
    _id: string;
    name: string;
    logoUrl: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
  collaborators?: Array<{
    _id: string;
    name: string;
    email: string;
    image: string;
  }>;
  sharedAssets?: Array<{
    name: string;
    url: string;
    addedBy: string;
    addedAt: string;
  }>;
  guidelines?: {
    objective?: string;
    deliverables?: string[];
    preferredColors?: string[];
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [brandMembers, setBrandMembers] = useState<BrandMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [canvasName, setCanvasName] = useState("");
  const [canvasTemplate, setCanvasTemplate] = useState("instagram-post");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [creatingCanvas, setCreatingCanvas] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "designs" | "guidelines" | "assets"
  >("designs");

  useEffect(() => {
    fetchProject();
    fetchCanvases();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/project/${projectId}`);
      const data = await res.json();

      if (data.success) {
        setProject(data.project);
        setIsOwner(data.isOwner);

        if (data.project.brand?._id) {
          fetchBrandMembers(data.project.brand._id);
        }
      } else {
        alert(data.error || "Failed to load project");
        router.push("/project");
      }
    } catch (e) {
      router.push("/project");
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandMembers = async (brandId: string) => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`/api/brand/${brandId}`);
      const data = await res.json();

      if (data.success && data.brand) {
        const members = [data.brand.owner, ...(data.brand.viewers || [])];
        setBrandMembers(members);
      }
    } catch (e) {
      console.error("Failed to load brand members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchCanvases = async () => {
    try {
      const res = await fetch(`/api/project/${projectId}/canvas`);
      const data = await res.json();

      if (data.success) {
        setCanvases(data.canvases);
      }
    } catch (e) {
      console.error("Failed to load canvases");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project?")) return;

    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/project");
      }
    } catch {
      alert("Failed to delete");
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (!confirm("Delete this canvas?")) return;

    try {
      const res = await fetch(`/api/project/${projectId}/canvas/${canvasId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCanvases();
      }
    } catch {
      alert("Failed to delete canvas");
    }
  };

  const handleQuickAddCollaborator = async (userId: string) => {
    try {
      const res = await fetch(`/api/project/${projectId}/add-collaborator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setShowCollabModal(false);
        fetchProject();
      } else {
        alert(data.error || "Failed to add collaborator");
      }
    } catch {
      alert("Failed to add");
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;

    setAddingCollab(true);
    try {
      const res = await fetch(`/api/project/${projectId}/add-collaborator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: collabEmail }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Added ${collabEmail}`);
        setCollabEmail("");
        setShowCollabModal(false);
        fetchProject();
      } else {
        alert(data.error || "Failed to add collaborator");
      }
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm("Remove this collaborator?")) return;

    try {
      const res = await fetch(`/api/project/${projectId}/remove-collaborator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        fetchProject();
      }
    } catch {
      alert("Failed to remove");
    }
  };

  const createCanvas = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate custom dimensions
    if (canvasTemplate === "custom") {
      if (!customWidth || !customHeight) {
        alert("Please enter both width and height for custom canvas");
        return;
      }

      const width = parseInt(customWidth);
      const height = parseInt(customHeight);

      if (width < 1 || width > 10000 || height < 1 || height > 10000) {
        alert("Canvas dimensions must be between 1 and 10000 pixels");
        return;
      }
    }

    setCreatingCanvas(true);
    try {
      const payload: any = {
        name: canvasName,
        template: canvasTemplate,
      };

      // Add custom dimensions if template is custom
      if (canvasTemplate === "custom") {
        payload.customWidth = parseInt(customWidth);
        payload.customHeight = parseInt(customHeight);
      }

      const res = await fetch(`/api/project/${projectId}/canvas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowCanvasModal(false);
        setCanvasName("");
        setCanvasTemplate("instagram-post");
        setCustomWidth("");
        setCustomHeight("");
        fetchCanvases();
        router.push(`/canvas/${data.canvas._id}`);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to create canvas");
    } finally {
      setCreatingCanvas(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredCanvases = canvases.filter((canvas) =>
    canvas.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const availableMembers = brandMembers.filter((member) => {
    if (member._id === project.owner._id) return false;
    if (project.collaborators?.some((c) => c._id === member._id)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching projects page style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/project")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {project.brand && (
              <>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded justify-center items-center flex overflow-hidden border border-gray-200">
                    <img
                      src={project.brand.logoUrl}
                      alt={project.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-lg text-gray-600">
                    {project.brand.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 max-w-2xl">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCanvasModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Design
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-[1px]">
            {[
              { key: "designs", label: "Designs", count: canvases.length },
              {
                key: "guidelines",
                label: "Guidelines",
                show: !!project.guidelines,
              },
              {
                key: "assets",
                label: "Assets",
                count: project.sharedAssets?.length || 0,
                show: (project.sharedAssets?.length || 0) > 0,
              },
            ]
              .filter((tab) => tab.show !== false)
              .map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Designs Tab */}
            {activeTab === "designs" && (
              <div>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search designs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {filteredCanvases.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery ? "No designs found" : "No designs yet"}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      {searchQuery
                        ? "Try different keywords or create a new design"
                        : "Create your first canvas to start designing"}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setShowCanvasModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Canvas
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCanvases.map((canvas) => {
                      const hasThumbnail =
                        canvas.thumbnail && canvas.thumbnail.trim().length > 0;

                      return (
                        <div
                          key={canvas._id}
                          className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                          onClick={() => router.push(`/canvas/${canvas._id}`)}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            {hasThumbnail ? (
                              <Image
                                src={canvas.thumbnail!}
                                alt={canvas.name}
                                width={100}
                                height={100}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <FileText className="w-12 h-12 text-blue-400" />
                            )}

                            {/* Delete Button */}
                            {isOwner && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCanvas(canvas._id);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {canvas.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 capitalize">
                                {canvas.template.replace("-", " ")}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(canvas.updatedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Guidelines Tab */}
            {activeTab === "guidelines" && project.guidelines && (
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {project.guidelines.objective && (
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          Objective
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {project.guidelines.objective}
                        </td>
                      </tr>
                    )}

                    {project.guidelines.deliverables &&
                      project.guidelines.deliverables.length > 0 && (
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            Deliverables
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">
                            <ul className="space-y-2">
                              {project.guidelines.deliverables.map((d, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}

                    {project.guidelines.preferredColors &&
                      project.guidelines.preferredColors.length > 0 && (
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            Brand Colors
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              {project.guidelines.preferredColors.map(
                                (color, i) => (
                                  <div key={i} className="group relative">
                                    <div
                                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm group-hover:scale-110 transition-transform cursor-pointer"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
                                      {color}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                    {project.guidelines.notes && (
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          Notes
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {project.guidelines.notes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Assets Tab */}
            {activeTab === "assets" &&
              project.sharedAssets &&
              project.sharedAssets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.sharedAssets.map((asset, i) => (
                    <div
                      key={i}
                      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-blue-100">
                        <Image
                          src={asset.url}
                          alt={asset.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                          {asset.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(asset.addedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Sidebar - Team Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Team
                </h3>
                {isOwner && (
                  <Button
                    size="sm"
                    onClick={() => setShowCollabModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Invite
                  </Button>
                )}
              </div>

              {/* Owner */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Owner</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-100">
                    <Image
                      src={project.owner.image}
                      alt={project.owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {project.owner.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.owner.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collaborators */}
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">
                    Collaborators ({project.collaborators.length})
                  </p>
                  <div className="space-y-3">
                    {project.collaborators.map((collab) => (
                      <div
                        key={collab._id}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={collab.image}
                              alt={collab.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {collab.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {collab.email}
                            </p>
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCollaborator(collab._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborator Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Add Collaborator
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Invite team members to collaborate
              </p>

              {project.brand && availableMembers.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    From {project.brand.name}
                  </p>
                  {loadingMembers ? (
                    <p className="text-sm text-gray-500">Loading members...</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleQuickAddCollaborator(member._id)
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className={
                  project.brand && availableMembers.length > 0
                    ? "pt-6 border-t border-gray-200"
                    : ""
                }
              >
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {project.brand && availableMembers.length > 0
                    ? "Or invite by email"
                    : "Invite by email"}
                </p>
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCollabModal(false);
                        setCollabEmail("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addingCollab}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {addingCollab ? "Adding..." : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Creation Modal */}
      {showCanvasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create New Canvas
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose a template to get started
              </p>

              <form onSubmit={createCanvas} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canvas Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={canvasName}
                    onChange={(e) => setCanvasName(e.target.value)}
                    placeholder="e.g., Instagram Holiday Post"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={canvasTemplate}
                    onChange={(e) => {
                      setCanvasTemplate(e.target.value);
                      // Clear custom dimensions when changing away from custom
                      if (e.target.value !== "custom") {
                        setCustomWidth("");
                        setCustomHeight("");
                      }
                    }}
                  >
                    {Object.entries(CANVAS_TEMPLATES).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Size Inputs - Only show when 'custom' is selected */}
                {canvasTemplate === "custom" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-900">
                        Custom Dimensions (Pixels)
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Width (px) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          placeholder="e.g., 1920"
                          required
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Height (px) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          placeholder="e.g., 1080"
                          required
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Maximum size: 10000×10000px
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCanvasModal(false);
                      setCanvasName("");
                      setCanvasTemplate("instagram-post");
                      setCustomWidth("");
                      setCustomHeight("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      creatingCanvas ||
                      (canvasTemplate === "custom" &&
                        (!customWidth || !customHeight))
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {creatingCanvas ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
