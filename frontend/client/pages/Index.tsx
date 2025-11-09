import Header from "@/components/Header";
import { ArrowRight, Zap, Brain, Gauge, Database, Workflow, Shield } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-24" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-badge border border-green-200">
              Multi-Agent AI Platform
            </span>
          </div>

          <h1 className="text-display">
            From Natural Language to
            <br />
            <span className="text-black">
              Deployed AI Agents
            </span>
          </h1>

          <p className="text-subtitle max-w-2xl mx-auto">
            Build sophisticated multi-agent reasoning systems powered by NVIDIA Nemotron
            through an intuitive visual canvas. From concept to production in weeks, not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg">
              Launch Canvas
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors text-lg border border-border">
              View Demo
            </button>
          </div>

          <p className="text-body-sm text-muted pt-8">
            Powered by NVIDIA Nemotron • No coding required • Enterprise-ready
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-h1 mb-4">
            Why HYDRA Wins
          </h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Everything you need to build production-ready multi-agent systems
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Model Fine-Tuning",
              description:
                "Automatically fine-tune Nemotron models on your domain-specific data from connected knowledge bases.",
            },
            {
              icon: Workflow,
              title: "Visual Canvas",
              description:
                "Intuitive drag-and-drop interface to design complex agentic workflows without writing code.",
            },
            {
              icon: Zap,
              title: "Multi-Agent Orchestration",
              description:
                "Build teams of specialized agents that collaborate intelligently using the Core orchestrator.",
            },
            {
              icon: Shield,
              title: "Auto Deployment",
              description:
                "Automatically deploys trained systems to production with NVIDIA NIMs and Brev GPU infrastructure.",
            },
            {
              icon: Gauge,
              title: "Monitoring & Retraining",
              description:
                "Real-time performance monitoring with automatic retraining when thresholds are breached.",
            },
            {
              icon: Database,
              title: "Knowledge Integration",
              description:
                "Connect CSV files, S3 buckets, databases, and GitHub repositories for intelligent agent training.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-lg border border-border hover:border-green-200 transition-colors group">
              <feature.icon className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-h4 mb-3">
                {feature.title}
              </h3>
              <p className="text-body text-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-h1 text-center mb-4">
          The HYDRA Pipeline
        </h2>
        <p className="text-subtitle text-center max-w-2xl mx-auto mb-16">
          Three intelligent meta-agents automate your entire ML lifecycle
        </p>

        <div className="space-y-8">
          {[
            {
              num: "1",
              title: "Agent Trainer",
              description:
                "Automatically fine-tunes all models on your domain data, binds them to tools, and validates performance before deployment.",
              details: [
                "NeMo fine-tuning",
                "Tool binding",
                "Performance validation",
              ],
            },
            {
              num: "2",
              title: "Agent Deployer",
              description:
                "Intelligently deploys trained agents to NVIDIA NIMs with Brev GPU infrastructure and creates REST API endpoints.",
              details: [
                "NIM configuration",
                "GPU provisioning",
                "API endpoint generation",
              ],
            },
            {
              num: "3",
              title: "Agent Monitor",
              description:
                "Continuously monitors performance, collects metrics, detects anomalies, and triggers automatic retraining when needed.",
              details: ["Real-time metrics", "Alert management", "Auto-retraining"],
            },
          ].map((step, idx) => (
            <div key={idx} className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-600 text-white font-bold text-lg">
                  {step.num}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-h3 mb-2">
                  {step.title}
                </h3>
                <p className="text-body text-foreground mb-4">
                  {step.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.details.map((detail, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-h1 text-center mb-4">
          Built for Real-World Problems
        </h2>
        <p className="text-subtitle text-center max-w-2xl mx-auto mb-16">
          HYDRA excels at building sophisticated agentic AI patterns
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Multi-Agent Systems",
              description:
                "Build teams of specialized agents that collaborate. Example: Report Generator with Research, Outline, Writer, and Editor agents.",
            },
            {
              title: "Agentic RAG",
              description:
                "Systems that intelligently decide when to retrieve information, perfect for domain-specific assistants with dynamic knowledge needs.",
            },
            {
              title: "ReAct Pattern Workflows",
              description:
                "Agents that Reason → Act → Observe in loops. Example: Automated debugging, technical support systems.",
            },
            {
              title: "Tool-Calling Applications",
              description:
                "Leverage Nemotron's exceptional ability to use external APIs. Example: Finance analysis, DevOps automation.",
            },
          ].map((useCase, idx) => (
            <div
              key={idx}
              className="p-8 rounded-lg border border-border hover:border-green-200 transition-all group hover:shadow-lg"
            >
              <h3 className="text-h4 mb-3 group-hover:text-green-600 transition-colors">
                {useCase.title}
              </h3>
              <p className="text-body text-foreground">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="bg-gradient-to-r from-gray-50 via-green-50 to-gray-50 rounded-2xl border border-green-200 p-12 md:p-16 text-center">
          <h2 className="text-h1 mb-4">
            Ready to Build?
          </h2>
          <p className="text-subtitle max-w-2xl mx-auto mb-8">
            Transform your domain expertise into production-ready multi-agent AI systems.
          </p>
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg inline-flex items-center gap-2">
            Launch Your First Project
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-foreground text-body-sm">
            <div>© 2024 HYDRA. Powered by NVIDIA Nemotron.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-foreground hover:text-green-600 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-foreground hover:text-green-600 transition-colors">
                GitHub
              </a>
              <a href="#" className="text-foreground hover:text-green-600 transition-colors">
                Community
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
