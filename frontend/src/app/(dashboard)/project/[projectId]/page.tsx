"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, UserPlus, X, Plus } from "lucide-react";
import Image from "next/image";

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

  // Canvas states
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [canvasName, setCanvasName] = useState("");
  const [canvasTemplate, setCanvasTemplate] = useState("instagram-post");
  const [creatingCanvas, setCreatingCanvas] = useState(false);

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
    setCreatingCanvas(true);
    try {
      const res = await fetch(`/api/project/${projectId}/canvas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: canvasName,
          template: canvasTemplate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCanvasModal(false);
        setCanvasName("");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-b-2 border-indigo-600 animate-spin" />
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/project")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {isOwner && (
            <div className="flex gap-2">
              <Button onClick={() => setShowCollabModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Collaborator
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            {project.brand && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={project.brand.logoUrl}
                  alt={project.brand.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mb-2">{project.description}</p>
              )}
              {project.brand && (
                <p className="text-sm text-gray-500">
                  Brand: {project.brand.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Canvases */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Canvases ({canvases.length})</h2>
                <Button size="sm" onClick={() => setShowCanvasModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Canvas
                </Button>
              </div>

              {canvases.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No canvases yet. Create your first design!
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {canvases.map((canvas) => (
                    <div
                      key={canvas._id}
                      className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                      onClick={() => router.push(`/canvas/${canvas._id}`)}
                    >
                      <p className="font-medium text-sm mb-1">{canvas.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {canvas.template.replace("-", " ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(canvas.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guidelines */}
            {project.guidelines && (
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Guidelines</h2>

                {project.guidelines.objective && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Objective
                    </h3>
                    <p className="text-gray-700">
                      {project.guidelines.objective}
                    </p>
                  </div>
                )}

                {project.guidelines.deliverables &&
                  project.guidelines.deliverables.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Deliverables
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {project.guidelines.deliverables.map((d, i) => (
                          <li key={i} className="text-gray-700">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {project.guidelines.preferredColors &&
                  project.guidelines.preferredColors.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Preferred Colors
                      </h3>
                      <div className="flex gap-2">
                        {project.guidelines.preferredColors.map((color, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {project.guidelines.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Notes
                    </h3>
                    <p className="text-gray-700">{project.guidelines.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Shared Assets */}
            {project.sharedAssets && project.sharedAssets.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Shared Assets</h2>
                <div className="grid grid-cols-2 gap-3">
                  {project.sharedAssets.map((asset, i) => (
                    <div
                      key={i}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      <div className="relative h-32 bg-gray-100">
                        <Image
                          src={asset.url}
                          alt={asset.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(asset.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner */}
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-3">
                {isOwner ? "You own this" : "Owner"}
              </p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={project.owner.image}
                    alt={project.owner.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{project.owner.name}</p>
                  <p className="text-xs text-gray-500">{project.owner.email}</p>
                </div>
              </div>
            </div>

            {/* Collaborators */}
            {project.collaborators && project.collaborators.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-3">
                  Collaborators ({project.collaborators.length})
                </p>
                <div className="space-y-3">
                  {project.collaborators.map((collab) => (
                    <div
                      key={collab._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={collab.image}
                            alt={collab.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{collab.name}</p>
                          <p className="text-xs text-gray-500">
                            {collab.email}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCollaborator(collab._id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Created</p>
              <p className="text-sm font-medium">
                {new Date(project.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborator Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Add Collaborator</h2>

            {project.brand && availableMembers.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  From {project.brand.name}
                </p>
                {loadingMembers ? (
                  <p className="text-sm text-gray-500">Loading members...</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
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
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddCollaborator(member._id)}
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
                  ? "pt-4 border-t"
                  : ""
              }
            >
              <p className="text-sm font-medium text-gray-700 mb-2">
                {project.brand && availableMembers.length > 0
                  ? "Or add by email"
                  : "Add by email"}
              </p>
              <form onSubmit={handleAddCollaborator}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-4"
                />
                <div className="flex gap-2">
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
                    className="flex-1"
                  >
                    {addingCollab ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Modal */}
      {showCanvasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Canvas</h2>
            <form onSubmit={createCanvas}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Canvas Name *
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={canvasName}
                  onChange={(e) => setCanvasName(e.target.value)}
                  placeholder="Social Media Post"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Template
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={canvasTemplate}
                  onChange={(e) => setCanvasTemplate(e.target.value)}
                >
                  <option value="instagram-post">
                    Instagram Post (1080x1080)
                  </option>
                  <option value="instagram-story">
                    Instagram Story (1080x1920)
                  </option>
                  <option value="facebook-post">
                    Facebook Post (1200x630)
                  </option>
                  <option value="twitter-post">Twitter Post (1200x675)</option>
                  <option value="linkedin-post">
                    LinkedIn Post (1200x627)
                  </option>
                  <option value="youtube-thumbnail">
                    YouTube Thumbnail (1280x720)
                  </option>
                  <option value="poster">Poster (18x24 in)</option>
                  <option value="flyer">Flyer (8.5x11 in)</option>
                  <option value="business-card">
                    Business Card (3.5x2 in)
                  </option>
                  <option value="presentation-slide">
                    Presentation Slide (1920x1080)
                  </option>
                  <option value="web-banner">Web Banner (728x90)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCanvasModal(false);
                    setCanvasName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingCanvas}
                  className="flex-1"
                >
                  {creatingCanvas ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
