"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
}

const ProjectPage = () => {
  const router = useRouter();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // ✅ User's brands
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(""); // ✅ Brand selection
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchBrands(); // ✅ Load brands
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
        // Combine owned and shared brands
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
          brandId: selectedBrandId || null, // ✅ Send brand
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Owned */}
        <div className="mb-8">
          <h2 className="font-semibold mb-3">
            My Projects ({ownedProjects.length})
          </h2>
          {ownedProjects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects yet</p>
          ) : (
            <div className="grid gap-3">
              {ownedProjects.map((p) => (
                <div
                  key={p._id}
                  className="bg-white border rounded-lg p-4 flex items-center gap-4"
                >
                  {p.brand && (
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={p.brand.logoUrl}
                        alt={p.brand.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/project/${p._id}`)}
                  >
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-sm text-gray-600">{p.description}</p>
                    )}
                    {p.brand && (
                      <p className="text-xs text-gray-400 mt-1">
                        {p.brand.name}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(p._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shared */}
        {sharedProjects.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">
              Shared with Me ({sharedProjects.length})
            </h2>
            <div className="grid gap-3">
              {sharedProjects.map((p) => (
                <div
                  key={p._id}
                  className="bg-white border rounded-lg p-4 cursor-pointer"
                  onClick={() => router.push(`/project/${p._id}`)}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-400">By {p.owner?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Project Name *
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Landing Page Redesign"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                />
              </div>

              {/* ✅ Brand Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Associated Brand (Optional)
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
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
                <p className="text-xs text-gray-500 mt-1">
                  Brand members will be suggested as collaborators
                </p>
              </div>

              <div className="flex gap-2">
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
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
