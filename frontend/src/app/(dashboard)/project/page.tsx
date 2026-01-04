"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Search, FolderOpen, Calendar } from "lucide-react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logoUrl: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  brand?: { _id: string; name: string; logoUrl: string };
  owner?: any;
  updatedAt: string;
  createdAt?: string;
}

const ProjectPage = () => {
  const router = useRouter();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "owned" | "shared">("all");

  useEffect(() => {
    fetchProjects();
    fetchBrands();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project");
      const data = await res.json();
      if (data.success) {
        setOwnedProjects(data.ownedProjects);
        setSharedProjects(data.sharedProjects);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brand/my-brands");
      const data = await res.json();
      if (data.success) {
        setBrands([...data.ownedBrands, ...data.sharedBrands]);
      }
    } catch (e) {
      console.error("Failed to load brands");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          brandId: selectedBrandId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName("");
        setDescription("");
        setSelectedBrandId("");
        fetchProjects();
      } else {
        alert(data.error);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch(`/api/project/${id}`, { method: "DELETE" });
      fetchProjects();
    } catch {
      alert("Failed to delete");
    }
  };

  const getFilteredProjects = () => {
    let projects: Project[] = [];

    if (filterTab === "all") {
      projects = [...ownedProjects, ...sharedProjects];
    } else if (filterTab === "owned") {
      projects = ownedProjects;
    } else {
      projects = sharedProjects;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.brand?.name.toLowerCase().includes(query)
      );
    }

    return projects;
  };

  const filteredProjects = getFilteredProjects();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProjects.length} total
              </p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create new
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-6 -mb-[1px]">
            {[
              {
                key: "all",
                label: "All Projects",
                count: ownedProjects.length + sharedProjects.length,
              },
              {
                key: "owned",
                label: "My Projects",
                count: ownedProjects.length,
              },
              {
                key: "shared",
                label: "Shared with Me",
                count: sharedProjects.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                  filterTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
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
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery
                ? "Try different keywords or create a new project"
                : "Create your first project to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((p) => {
              const isOwned = ownedProjects.some((op) => op._id === p._id);

              return (
                <div
                  key={p._id}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/project/${p._id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    {p.brand ? (
                      <div className="relative w-16 h-16">
                        <Image
                          src={p.brand.logoUrl}
                          alt={p.brand.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <FolderOpen className="w-12 h-12 text-blue-400" />
                    )}

                    {/* Delete Button - Only for owned projects */}
                    {isOwned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p._id);
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
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(p.updatedAt)}
                      </div>
                      {p.brand && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {p.brand.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create New Project
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Start a new creative project
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Landing Page Design"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand (Optional)
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Link this project to a brand for easier collaboration
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setName("");
                      setDescription("");
                      setSelectedBrandId("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {creating ? "Creating..." : "Create"}
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

export default ProjectPage;
