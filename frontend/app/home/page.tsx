"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import {
  FolderKanban,
  Rocket,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Calls graph data - peak at 9
const apiCallsData = [
  { time: "00:00", calls: 2 },
  { time: "04:00", calls: 1 },
  { time: "08:00", calls: 5 },
  { time: "12:00", calls: 9 },
  { time: "16:00", calls: 7 },
  { time: "20:00", calls: 4 },
];

// Success Rate graph data - ~100% with 1-2 dots slightly lower
const successRateData = [
  { day: "Mon", rate: 100 },
  { day: "Tue", rate: 100 },
  { day: "Wed", rate: 99.8 },
  { day: "Thu", rate: 100 },
  { day: "Fri", rate: 100 },
  { day: "Sat", rate: 99.9 },
  { day: "Sun", rate: 100 },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
}

export default function HomePage() {
  const { getValidToken } = useAuth();
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeDeployments, setActiveDeployments] = useState(0);
  const [apiCallsToday, setApiCallsToday] = useState(42);
  const [recentProjects, setRecentProjects] = useState<Array<{ id: string; name: string; status: string; lastModified: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentProjects();
  }, []);

  const fetchStats = async () => {
    const token = await getValidToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotalProjects(data.total_projects);
        setActiveDeployments(data.active_deployments);
        setApiCallsToday(data.api_calls_today);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentProjects = async () => {
    const token = await getValidToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const projects = await response.json();
        // Get the 4 most recently updated projects
        const recent = projects
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            lastModified: formatRelativeTime(p.updated_at),
          }));
        setRecentProjects(recent);
      }
    } catch (error) {
      console.error("Error fetching recent projects:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Total Projects Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3eef7' }}>
                  <FolderKanban className="w-5 h-5" style={{ color: '#341f4f' }} />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{isLoading ? "..." : totalProjects}</div>
              <div className="text-sm text-muted-foreground">Total projects created</div>
            </div>

            {/* Active Deployments Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Active Deployments</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3eef7' }}>
                  <Rocket className="w-5 h-5" style={{ color: '#341f4f' }} />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{isLoading ? "..." : activeDeployments}</div>
              <div className="text-sm text-muted-foreground">All systems operational</div>
            </div>

            {/* API Calls Today Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">API Calls Today</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3eef7' }}>
                  <Activity className="w-5 h-5" style={{ color: '#341f4f' }} />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{isLoading ? "..." : apiCallsToday}</div>
              <div className="text-sm text-muted-foreground">API calls today</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* API Calls Chart */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">API Calls (24h)</h3>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={apiCallsData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCalls)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Success Rate Chart */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Success Rate</h3>
                <TrendingUp className="w-5 h-5" style={{ color: '#341f4f' }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis domain={[99, 100]} stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#341f4f" 
                    strokeWidth={3}
                    dot={{ fill: '#341f4f', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Projects Section */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="bg-gray-50 rounded-lg p-4 border border-border hover:border-gray-300 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 
                          className="font-medium text-foreground text-sm transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#341f4f'}
                          onMouseLeave={(e) => e.currentTarget.style.color = ''}
                        >
                          {project.name}
                        </h3>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            project.status === "deployed" 
                              ? "text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                          style={project.status === "deployed" ? { backgroundColor: '#341f4f' } : {}}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {project.lastModified}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-4 text-center text-muted-foreground py-8">
                  {isLoading ? "Loading..." : "No projects yet. Create your first project!"}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
