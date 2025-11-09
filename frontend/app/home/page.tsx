"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  FolderKanban,
  Rocket,
  Activity,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const apiCallsData = [
  { time: "00:00", calls: 45 },
  { time: "04:00", calls: 120 },
  { time: "08:00", calls: 320 },
  { time: "12:00", calls: 450 },
  { time: "16:00", calls: 380 },
  { time: "20:00", calls: 280 },
];

const successRateData = [
  { day: "Mon", rate: 98.2 },
  { day: "Tue", rate: 98.5 },
  { day: "Wed", rate: 98.8 },
  { day: "Thu", rate: 98.3 },
  { day: "Fri", rate: 98.6 },
  { day: "Sat", rate: 98.4 },
  { day: "Sun", rate: 98.5 },
];

const deploymentData = [
  { name: "Deployed", value: 12 },
  { name: "Draft", value: 8 },
  { name: "Archived", value: 4 },
];

export default function HomePage() {
  const recentProjects = [
    { name: "Customer Support Agent", status: "deployed", lastModified: "2 hours ago" },
    { name: "Data Analysis Pipeline", status: "deployed", lastModified: "1 day ago" },
    { name: "Content Generator", status: "draft", lastModified: "3 days ago" },
    { name: "E-commerce Assistant", status: "deployed", lastModified: "5 days ago" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          {/* Header with Create Button */}
          <div className="flex items-center justify-start mb-8">
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
              <Plus className="w-4 h-4" />
              Create New Project
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Total Projects Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">24</div>
              <div className="text-sm text-muted-foreground">+3 from last month</div>
            </div>

            {/* Active Deployments Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Active Deployments</span>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">12</div>
              <div className="text-sm text-muted-foreground">All systems operational</div>
            </div>

            {/* API Calls Today Card */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">API Calls Today</span>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">1.2K</div>
              <div className="text-sm text-muted-foreground">+15% from yesterday</div>
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
                  <YAxis stroke="#888" fontSize={12} />
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
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis domain={[97, 100]} stroke="#888" fontSize={12} />
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
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 4 }}
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
              {recentProjects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-border hover:border-gray-300 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-foreground text-sm group-hover:text-green-600 transition-colors">{project.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      project.status === "deployed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {project.lastModified}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
