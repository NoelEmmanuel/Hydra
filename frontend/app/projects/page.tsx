"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateProjectModal from "@/components/CreateProjectModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Link from "next/link";
import { Search, Clock, Trash2, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name || undefined,
        description: description || undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to create project");
    }

    const newProject = await response.json();
    setProjects([newProject, ...projects]);
    
    // Navigate to the new project
    window.location.href = `/projects/${newProject.id}`;
  };

  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, projectId, projectName });
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!token || !deleteModal.projectId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects/${deleteModal.projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove project from the list
      setProjects(projects.filter((p) => p.id !== deleteModal.projectId));
      setDeleteModal({ isOpen: false, projectId: null, projectName: "" });
    } catch (error) {
      console.error("Error deleting project:", error);
      setDeleteError("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, projectId: null, projectName: "" });
    setDeleteError(null);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header with Search and Create Button */}
          <div className="sticky top-0 z-10 bg-gray-50/50 pb-8 mb-8">
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              {/* Create New Project Button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group min-h-[180px] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === "deployed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {project.status}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>updated {formatDate(project.updated_at)}</span>
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
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        projectName={deleteModal.projectName}
        isDeleting={isDeleting}
      />
      {deleteError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
          <p className="text-sm flex-1">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-700 hover:text-red-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}

