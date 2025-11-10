"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { Search } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  authorized: boolean;
}

const integrations: Integration[] = [
  {
    id: "gmail",
    name: "Gmail",
    icon: "/gmail.png",
    description: "Send and receive emails, read messages, manage inbox, and access Gmail API for automated email workflows.",
    authorized: false,
  },
  {
    id: "slack",
    name: "Slack",
    icon: "/slack.png",
    description: "Send messages to channels, post updates, manage conversations, and integrate with Slack workspaces for team communication.",
    authorized: false,
  },
  {
    id: "github",
    name: "GitHub",
    icon: "/github.png",
    description: "Access repositories, read code, create issues, manage pull requests, and interact with GitHub repositories programmatically.",
    authorized: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "/google-drive.png",
    description: "Read and write files, manage folders, upload documents, and access Google Drive storage for file operations.",
    authorized: false,
  },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>(
    integrations.reduce((acc, integration) => {
      acc[integration.id] = integration.authorized;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const filteredIntegrations = integrations.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAuthorize = (id: string) => {
    setIntegrationStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Search Bar - Sticky */}
          <div className="sticky top-0 z-10 bg-gray-50/50 pb-8 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search integrations..."
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

          {/* Integrations Grid */}
          {filteredIntegrations.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white rounded-xl p-6 border border-border shadow-sm flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={integration.icon}
                        alt={integration.name}
                        width={32}
                        height={32}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {integration.description}
                      </p>
                    </div>
                  </div>

                  {/* Authorize Button */}
                  <div className="mt-auto pt-4 border-t border-border">
                    <button
                      onClick={() => handleAuthorize(integration.id)}
                      className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                        integrationStates[integration.id]
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "text-white"
                      }`}
                      style={!integrationStates[integration.id] ? { backgroundColor: '#341f4f' } : {}}
                      onMouseEnter={(e) => !integrationStates[integration.id] && (e.currentTarget.style.backgroundColor = '#2a1840')}
                      onMouseLeave={(e) => !integrationStates[integration.id] && (e.currentTarget.style.backgroundColor = '#341f4f')}
                    >
                      {integrationStates[integration.id] ? "Authorized" : "Authorize"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No integrations found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

