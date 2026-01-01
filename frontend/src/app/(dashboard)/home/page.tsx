import { Search, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  const recentProjects = [
    { name: "Landing Page Redesign", updated: "2h ago", status: "Active" },
    { name: "Brand Logo Refresh", updated: "1d ago", status: "Review" },
    { name: "Social Media Kit", updated: "3d ago", status: "Completed" },
    { name: "Product Photography", updated: "5d ago", status: "Active" },
    { name: "Website Banner", updated: "1w ago", status: "Completed" },
    { name: "App Icon Design", updated: "2w ago", status: "Review" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-lg text-gray-600">
            Continue working on your creative projects
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="w-full pl-12 h-14 bg-white border-gray-200 focus:border-blue-500 rounded-xl text-base shadow-sm"
          />
        </div>

        {/* Create Button */}
        <Link href="/canvas/create">
          <Button
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 h-16 text-lg rounded-xl shadow-sm"
          >
            <Plus className="w-6 h-6 mr-3" />
            Create New Canvas
          </Button>
        </Link>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {recentProjects.map((project, i) => (
              <Link key={i} href="/project/1">
                <div className="bg-white hover:shadow-md rounded-xl p-6 transition-all cursor-pointer border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {project.updated}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Review"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
