"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Search, Clock, MoreVertical } from "lucide-react";

const projects = [
  { id: 1, name: "Customer Support Agent", status: "deployed", lastModified: "2 hours ago", description: "AI-powered customer support system" },
  { id: 2, name: "Data Analysis Pipeline", status: "deployed", lastModified: "1 day ago", description: "Automated data processing workflow" },
  { id: 3, name: "Content Generator", status: "draft", lastModified: "3 days ago", description: "Multi-agent content creation system" },
  { id: 4, name: "E-commerce Assistant", status: "deployed", lastModified: "5 days ago", description: "Shopping experience optimization" },
  { id: 5, name: "Document Processor", status: "deployed", lastModified: "1 week ago", description: "Intelligent document analysis" },
  { id: 6, name: "Email Classifier", status: "draft", lastModified: "2 weeks ago", description: "Automated email categorization" },
  { id: 7, name: "Code Review Assistant", status: "deployed", lastModified: "2 weeks ago", description: "AI-powered code review system" },
  { id: 8, name: "Meeting Summarizer", status: "deployed", lastModified: "3 weeks ago", description: "Automatic meeting transcription and summary" },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-6">Projects</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg focus:outline-none transition-colors text-sm"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              />
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/home/projects/${project.id}`}
                  className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-foreground mb-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#341f4f'}
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                      >
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle menu click
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span 
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        project.status === "deployed" 
                          ? "text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      style={project.status === "deployed" ? { backgroundColor: '#341f4f' } : {}}
                    >
                      {project.status}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {project.lastModified}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

