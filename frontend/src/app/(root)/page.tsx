// app/page.tsx
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Palette,
  Wand2,
  Users,
  Rocket,
  Shield,
  BarChart,
} from "lucide-react";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-4 py-12 text-center max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-full border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
              AI-Powered Design Studio
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-black via-zinc-800 to-zinc-900 bg-clip-text text-transparent leading-tight mb-6 dark:from-zinc-100 dark:via-white dark:to-zinc-200">
              Create Stunning Designs
              <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                10x Faster with AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed dark:text-zinc-400">
              Transform your ideas into professional graphics in seconds. No
              design skills required. Just describe what you want, and watch AI
              bring it to life.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/home">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl shadow-indigo-500/25 h-14 px-8 text-lg font-semibold text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Creating Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-semibold"
            >
              GitHub
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
          {[
            {
              icon: <Wand2 className="w-6 h-6" />,
              title: "AI-Powered Design",
              description:
                "Generate professional designs from simple text prompts. Let AI handle the heavy lifting.",
              gradient: "from-indigo-500 to-purple-500",
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Lightning Fast",
              description:
                "Create social media posts, ads, and marketing materials in seconds, not hours.",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              icon: <Palette className="w-6 h-6" />,
              title: "Brand Consistency",
              description:
                "Save your brand colors, fonts, and assets. AI automatically applies them to every design.",
              gradient: "from-pink-500 to-rose-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}
              />
              <div
                className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-32 w-full max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-zinc-900 dark:text-white">
            Design in 3 Simple Steps
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 text-center mb-16">
            From idea to finished design in minutes
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Vision",
                description:
                  "Tell AI what you need in plain English. 'Create an Instagram post about coffee' - that's it!",
                icon: <Sparkles className="w-6 h-6" />,
              },
              {
                step: "02",
                title: "AI Creates Magic",
                description:
                  "Watch as AI generates professional designs with perfect layouts, colors, and typography.",
                icon: <Wand2 className="w-6 h-6" />,
              },
              {
                step: "03",
                title: "Customize & Export",
                description:
                  "Fine-tune with our editor, then download in PNG or JPEG. Ready for any platform.",
                icon: <Rocket className="w-6 h-6" />,
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-black text-zinc-100 dark:text-zinc-800 absolute -top-6 -left-2">
                  {step.step}
                </div>
                <div className="relative pt-8">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-32 w-full max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-zinc-900 dark:text-white">
            Perfect For Every Creator
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 text-center mb-16">
            Whatever you create, we've got you covered
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Users className="w-5 h-5" />,
                title: "Social Media Managers",
                desc: "Instagram, Facebook, LinkedIn posts",
              },
              {
                icon: <BarChart className="w-5 h-5" />,
                title: "Marketing Teams",
                desc: "Ads, banners, promotional graphics",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Small Businesses",
                desc: "Flyers, posters, business cards",
              },
              {
                icon: <Rocket className="w-5 h-5" />,
                title: "Content Creators",
                desc: "YouTube thumbnails, story graphics",
              },
            ].map((use, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {use.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">
                    {use.title}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">{use.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-32 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-600 dark:text-zinc-400">
          <p>
            © 2026 AI Design Studio. Create amazing designs with the power of
            AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
