"use client";

import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Link2, Zap, Play } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Getting Started with Hydra</h1>
            <p className="text-lg text-muted-foreground">
              Build sophisticated multi-agent AI systems powered by NVIDIA Nemotron. Follow these steps to create your first workflow.
            </p>
          </div>

          {/* Step 1: Authorize Integrations */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-2xl font-semibold text-foreground">Authorize Your Integrations</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Before building workflows, authorize the tools and services you want to use. Navigate to the Integrations page and authorize each service you need.
            </p>
            
            {/* Integration Cards Preview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { name: "Gmail", icon: "/gmail.png", description: "Email workflows" },
                { name: "Slack", icon: "/slack.png", description: "Team communication" },
                { name: "GitHub", icon: "/github.png", description: "Code repositories" },
              ].map((integration) => (
                <div key={integration.name} className="bg-white rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image
                        src={integration.icon}
                        alt={integration.name}
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 px-3 bg-green-600 text-white rounded-lg font-medium text-xs hover:bg-green-700 transition-colors">
                    Authorize
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> You can authorize integrations at any time. Authorized integrations are available for use in all your projects.
              </p>
            </div>
          </section>

          {/* Step 2: Create a Project */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-2xl font-semibold text-foreground">Create a New Project</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Start by creating a new project from the Home page. Each project represents a complete multi-agent workflow that you can design, test, and deploy.
            </p>
            
            {/* Project Card Preview */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm mb-6 max-w-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Customer Support Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered customer support system
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                  deployed
                </span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Last modified 2 hours ago
              </div>
            </div>
          </section>

          {/* Step 3: Understanding Nodes */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <h2 className="text-2xl font-semibold text-foreground">Understanding Node Types</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Hydra workflows are built using different types of nodes. Each node type serves a specific purpose in your multi-agent system.
            </p>

            <div className="space-y-6">
              {/* Core Node */}
              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100/80 rounded-lg flex items-center justify-center border-2 border-gray-300">
                      <Image
                        src="/core.png"
                        alt="Core"
                        width={52}
                        height={52}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Core Node</h3>
                    <p className="text-muted-foreground mb-4">
                      The central orchestrator of your workflow. Every project starts with a Core node that defines the overall objective and selects the Nemotron model to use.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Configuration:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Objective:</strong> Describe the workflow's purpose</li>
                        <li>• <strong>Nemotron Model:</strong> Choose Small, Medium, Large, or XL</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Node */}
              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100/80 rounded-lg flex items-center justify-center border-2 border-gray-300 relative">
                      <Image
                        src="/tool.png"
                        alt="Tool"
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        <Image src="/gmail.png" alt="Gmail" width={16} height={16} className="object-contain" unoptimized />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Tool Node</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect external services and APIs to your workflow. Tool nodes enable your agents to interact with Gmail, Slack, GitHub, Google Drive, and PostgreSQL.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Configuration:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Source:</strong> Select the service (Gmail, Slack, GitHub, etc.)</li>
                        <li>• Double-click the title to rename the node</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Base Node */}
              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100/80 rounded-lg flex items-center justify-center border-2 border-gray-300 relative">
                      <Image
                        src="/kb.png"
                        alt="Knowledge Base"
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        <Image src="/github.png" alt="GitHub" width={16} height={16} className="object-contain" unoptimized />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Knowledge Base Node</h3>
                    <p className="text-muted-foreground mb-4">
                      Provide structured data and documents to your agents. Knowledge Base nodes can connect to AWS S3, Google Drive, GitHub repositories, and more.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Configuration:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Source:</strong> Where your data is stored</li>
                        <li>• <strong>Type:</strong> JSON, CSV, XML, YAML, Parquet, Excel, or Image</li>
                        <li>• <strong>Schema:</strong> Define data structure (not required for Images)</li>
                        <li>• <strong>Link:</strong> URL to access the data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Node */}
              <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100/80 rounded-lg flex items-center justify-center border-2 border-gray-300 relative">
                      <Image
                        src="/model.png"
                        alt="Model"
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        <span className="text-xs font-semibold text-gray-700">L</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Model Node</h3>
                    <p className="text-muted-foreground mb-4">
                      Add additional Nemotron models to your workflow for specialized tasks. Use different model sizes (Small, Medium, Large, XL) based on your needs.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Configuration:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Type:</strong> Select Nemotron Small, Medium, Large, or XL</li>
                        <li>• The badge shows the selected size (S, M, L, XL)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Connect Nodes */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <h2 className="text-2xl font-semibold text-foreground">Connect Nodes</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Create connections between nodes by dragging from one node's connection point to another. Connections define the flow of data and control in your workflow.
            </p>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100/80 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-gray-300">
                    <Image src="/core.png" alt="Core" width={52} height={52} className="object-contain" unoptimized />
                  </div>
                  <p className="text-xs text-muted-foreground">Core</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100/80 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-gray-300 relative">
                    <Image src="/kb.png" alt="KB" width={40} height={40} className="object-contain" unoptimized />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                      <Image src="/github.png" alt="GitHub" width={16} height={16} className="object-contain" unoptimized />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Knowledge Base</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100/80 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-gray-300 relative">
                    <Image src="/tool.png" alt="Tool" width={40} height={40} className="object-contain" unoptimized />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                      <Image src="/slack.png" alt="Slack" width={16} height={16} className="object-contain" unoptimized />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Tool</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">How to Connect:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Hover over a node to see connection points</li>
                      <li>Click and drag from a connection point on one node to another</li>
                      <li>Release to create the connection</li>
                      <li>Click on a connection and press Delete/Backspace to remove it</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 5: Configure Nodes */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
              <h2 className="text-2xl font-semibold text-foreground">Configure Your Nodes</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Click on any node to open its configuration panel. Each node type has specific settings that customize its behavior in your workflow.
            </p>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Core Node Settings</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Define the workflow objective</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Select Nemotron model size</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Other Node Settings</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Rename nodes by double-clicking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Configure source, type, and schema</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step 6: Deploy */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">6</div>
              <h2 className="text-2xl font-semibold text-foreground">Deploy Your Workflow</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Once your workflow is complete, click the Deploy button in the bottom right corner of the canvas to make it live.
            </p>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-end gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">Ready to deploy?</p>
                  <p className="text-xs text-muted-foreground">Click the Deploy button</p>
                </div>
                <button className="bg-black text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Deploy
                </button>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Next Steps</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Start with a clear objective in your Core node</li>
                    <li>• Use Knowledge Bases for structured data</li>
                    <li>• Connect Tools for external actions</li>
                    <li>• Test workflows before deploying</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Tips & Tricks</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Drag nodes from the toolbar on the left</li>
                    <li>• Use zoom controls to navigate large workflows</li>
                    <li>• Save frequently as you build</li>
                    <li>• Monitor deployed workflows from Home</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

