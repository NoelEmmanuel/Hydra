"use client";

import Header from "@/components/Header";
import Image from "next/image";
import { Zap, Database, Workflow } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-24" />
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Build Multi-Agent Systems
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto py-2">
              Connect agents, tools, and data sources through a visual canvas.
          </p>
          <div className="">

          </div>
          <span className="px-4 py-1 rounded-full text-badge border" style={{ backgroundColor: '#f3eef7', color: '#341f4f', borderColor: '#a68bb8' }}>
              Powered by NVIDIA Nemotron
            </span>

          <div className="pt-8 pb-8">
            <div className="mx-auto max-w-4xl">
              <div className="flex rounded-lg overflow-hidden items-stretch" style={{ border: '1px solid rgba(0, 0, 0, 0.15)' }}>
                {/* Image Section */}
                <div className="flex-[0.65] overflow-hidden relative" style={{ minHeight: '400px' }}>
                  <Image
                    src="/canvas.png"
                    alt="Visual Canvas"
                    width={1200}
                    height={800}
                    className="absolute inset-0 w-full h-full object-cover scale-150"
                    style={{
                      objectPosition: 'center'
                    }}
                    unoptimized
                  />
                </div>
                
                {/* Workflow Explanation Card */}
                <div className="flex-[0.35] bg-white p-6 flex flex-col justify-center border-l shrink-0" style={{ borderColor: 'rgba(0, 0, 0, 0.15)' }}>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    Automated Incident Response System
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This workflow automates <span className="font-semibold" style={{ color: '#341f4f' }}>incident detection and resolution</span>. The first agent monitors <span className="font-semibold" style={{ color: '#341f4f' }}>system logs from S3 storage</span>, 
                    analyzes them for <span className="font-semibold" style={{ color: '#341f4f' }}>anomalies</span>, and sends real-time alerts to the team via <span className="font-semibold" style={{ color: '#341f4f' }}>Slack</span> when issues are detected. 
                    The second agent automatically creates <span className="font-semibold" style={{ color: '#341f4f' }}>GitHub issues</span> to track incidents and manages the resolution process, 
                    ensuring all incidents are properly documented and resolved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-5 md:py-7">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Workflow,
              title: "Visual Canvas",
              description:
                "Design workflows through an intuitive drag-and-drop interface.",
            },
            {
              icon: Zap,
              title: "Multi-Agent Orchestration",
              description:
                "Build teams of specialized agents that work together.",
            },
            {
              icon: Database,
              title: "Knowledge Integration",
              description:
                "Connect data sources including S3, databases, and GitHub repositories.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="p-6">
              <feature.icon className="w-10 h-10 mb-3" style={{ color: '#341f4f' }} />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

