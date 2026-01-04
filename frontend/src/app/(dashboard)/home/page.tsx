"use client";

import { Clock, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Canvas {
  _id: string;
  name: string;
  thumbnail?: string;
  template: string;
  updatedAt: string;
  project: {
    _id: string;
    name: string;
  };
}

interface Project {
  _id: string;
  name: string;
  updatedAt: string;
}

const Home = () => {
  const router = useRouter();
  const [recentCanvases, setRecentCanvases] = useState<Canvas[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);

      // Fetch all projects to get recent canvases
      const projectsRes = await fetch("/api/project");
      const projectsData = await projectsRes.json();

      if (projectsData.success) {
        const allProjects = [
          ...projectsData.ownedProjects,
          ...projectsData.sharedProjects,
        ];

        setRecentProjects(allProjects.slice(0, 6));

        // Fetch canvases from all projects
        const canvasPromises = allProjects.map((project: Project) =>
          fetch(`/api/project/${project._id}/canvas`)
            .then((res) => res.json())
            .then((data) => (data.success ? data.canvases : []))
            .catch(() => [])
        );

        const allCanvasArrays = await Promise.all(canvasPromises);
        const allCanvases = allCanvasArrays.flat();

        // Sort by updatedAt and take most recent
        const sortedCanvases = allCanvases.sort(
          (a: Canvas, b: Canvas) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setRecentCanvases(sortedCanvases.slice(0, 8));
      }
    } catch (e) {
      console.error("Failed to fetch recent activity:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
          </div>
          <p className="text-xl text-gray-600">Continue where you left off</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Canvases</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentCanvases.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentProjects.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentCanvases.length > 0
                    ? formatTimeAgo(recentCanvases[0].updatedAt)
                    : "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Canvases */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Canvases
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/project")}
              className="text-gray-600 hover:text-gray-900"
            >
              View all →
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin" />
            </div>
          ) : recentCanvases.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No canvases yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first canvas to get started
              </p>
              <Button
                onClick={() => router.push("/project")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                Go to Projects
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentCanvases.map((canvas) => {
                const hasThumbnail =
                  canvas.thumbnail && canvas.thumbnail.trim().length > 0;

                return (
                  <div
                    key={canvas._id}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/canvas/${canvas._id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {hasThumbnail ? (
                        <>
                          <Image
                            src={canvas.thumbnail!}
                            alt={canvas.name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </>
                      ) : (
                        <div className="flex items-center justify-center">
                          <FileText className="w-16 h-16 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {canvas.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {canvas.project?.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 capitalize">
                          {canvas.template.replace("-", " ")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(canvas.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.slice(0, 6).map((project) => (
                <div
                  key={project._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => router.push(`/project/${project._id}`)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Updated {formatTimeAgo(project.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
