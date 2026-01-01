import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900">
      <main className="flex flex-col items-center justify-center px-4 py-24 text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-black via-zinc-800 to-zinc-900 bg-clip-text text-transparent leading-tight mb-6 dark:from-zinc-100 dark:via-white dark:to-zinc-200">
              Build Stunning Designs
              <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                with AI Magic
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto leading-relaxed dark:text-zinc-400">
              Text-to-Image, Magic Edit, Auto-Layout. Replicate Canva AI with
              Stable Diffusion + LoRA in your browser.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl shadow-indigo-500/25 h-14 px-8 text-xl font-semibold text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Creating Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-xl border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-semibold"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl w-full px-8">
          {/* ... features unchanged ... */}
        </div>
      </main>
    </div>
  );
};

export default Home;
