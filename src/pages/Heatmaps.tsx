import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import { BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const initialHeatmapData: { lat: number; lng: number }[] = [];
const DEFAULT_CENTER: [number, number] = [10.0, 76.0]; // Fallback center (e.g., Kochi)
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface HeatLayerProps {
  points: { lat: number; lng: number; category?: string }[];
}

const getCategoryColor = (category?: string): { fill: string; border: string } => {
  switch (category) {
    case 'Potholes':
      return { fill: '#EF4444', border: '#DC2626' };
    case 'Garbage':
      return { fill: '#F59E0B', border: '#D97706' };
    case 'Street Lighting':
      return { fill: '#8B5CF6', border: '#7C3AED' };
    case 'Water Issues':
      return { fill: '#06B6D4', border: '#0891B2' };
    case 'Public Safety':
      return { fill: '#10B981', border: '#059669' };
    default:
      return { fill: '#64748B', border: '#475569' };
  }
};

const HeatLayer = ({ points }: HeatLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatPoints = points.map(point => [point.lat, point.lng, 0.45] as [number, number, number]);
    const layer = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
  }, [map, points]);

  return (
    <>
      {points.map((point, idx) => {
        const colors = getCategoryColor(point.category);
        return (
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            radius={6}
            fillColor={colors.fill}
            color={colors.border}
            weight={2}
            opacity={0.9}
            fillOpacity={0.8}
            title={point.category || 'Unknown'}
          />
        );
      })}
    </>
  );
};

const Heatmaps = () => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [selectedLayer, setSelectedLayer] = useState("all");
  const [heatmapData, setHeatmapData] = useState(initialHeatmapData);
  const [issueTypeData, setIssueTypeData] = useState([
    { name: "Potholes", value: 0, color: "#EF4444" },
    { name: "Garbage", value: 0, color: "#F59E0B" },
    { name: "Lighting", value: 0, color: "#8B5CF6" },
    { name: "Water", value: 0, color: "#06B6D4" },
    { name: "Safety", value: 0, color: "#10B981" },
    { name: "Other", value: 0, color: "#64748B" },
  ]);

  const mapLayers = [
    { id: "all", label: "All Issues", color: "#3B82F6" },
    { id: "potholes", label: "Potholes", color: "#EF4444" },
    { id: "garbage", label: "Garbage", color: "#F59E0B" },
    { id: "lighting", label: "Street Lighting", color: "#8B5CF6" },
    { id: "water", label: "Water Issues", color: "#06B6D4" },
    { id: "safety", label: "Public Safety", color: "#10B981" },
    { id: "others", label: "Others", color: "#64748B" }
  ];

  const departmentData = [
    { department: "Roads & Transport", resolved: 85, pending: 15, total: 120 },
    { department: "Water & Sanitation", resolved: 67, pending: 23, total: 90 },
    { department: "Public Works", resolved: 92, pending: 18, total: 110 },
    { department: "Electricity", resolved: 78, pending: 12, total: 90 },
    { department: "Parks & Recreation", resolved: 95, pending: 5, total: 60 }
  ];

  const trendData = [
    { month: "Jul", reports: 245, resolved: 198 },
    { month: "Aug", reports: 289, resolved: 234 },
    { month: "Sep", reports: 312, resolved: 267 },
    { month: "Oct", reports: 298, resolved: 276 },
    { month: "Nov", reports: 334, resolved: 301 },
    { month: "Dec", reports: 367, resolved: 329 },
    { month: "Jan", reports: 405, resolved: 378 }
  ];

  const getResolutionRate = (resolved: number, total: number) => {
    return Math.round((resolved / total) * 100);
  };

  const getResolutionColor = (rate: number) => {
    if (rate >= 85) return "text-green-600 dark:text-green-400";
    if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default center
          setCenter(DEFAULT_CENTER);
        }
      );
    } else {
      // Fallback to default center if geolocation not available
      setCenter(DEFAULT_CENTER);
    }
  }, []);

  // Fetch civic issue locations from Supabase
  useEffect(() => {
    async function fetchHeatmapData() {
      const { data, error } = await supabase
        .from('posts')
        .select('latitude, longitude, category');
      if (error) {
        console.error('Error fetching heatmap data:', error);
        return;
      }
      const layerToCategoryMap: Record<string, string | null> = {
        potholes: "Potholes",
        garbage: "Garbage",
        lighting: "Street Lighting",
        water: "Water Issues",
        safety: "Public Safety",
        others: "Other",
      };
      const selectedCategory = selectedLayer === 'all' ? null : layerToCategoryMap[selectedLayer];
      const filtered = data
        .filter(p => p.latitude && p.longitude && (
          selectedCategory === null ||
          (selectedCategory === 'Other'
            ? p.category?.startsWith('Other')
            : p.category === selectedCategory)
        ))
        .map(p => ({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude), category: p.category }));
      setHeatmapData(filtered);
    }
    fetchHeatmapData();
  }, [selectedLayer]);

  // Fetch issue type counts from Supabase
  useEffect(() => {
    async function fetchIssueTypeCounts() {
      const { data, error } = await supabase
        .from('posts')
        .select('category');
      if (error) {
        console.error('Error fetching issue type data:', error);
        return;
      }
      const counts = {
        Potholes: 0,
        Garbage: 0,
        Lighting: 0,
        Water: 0,
        Safety: 0,
        Other: 0,
      };
      data.forEach(post => {
        if (post.category === 'Potholes') counts.Potholes++;
        else if (post.category === 'Garbage') counts.Garbage++;
        else if (post.category === 'Street Lighting') counts.Lighting++;
        else if (post.category === 'Water Issues') counts.Water++;
        else if (post.category === 'Public Safety') counts.Safety++;
        else counts.Other++;
      });
      setIssueTypeData([
        { name: "Potholes", value: counts.Potholes, color: "#EF4444" },
        { name: "Garbage", value: counts.Garbage, color: "#F59E0B" },
        { name: "Lighting", value: counts.Lighting, color: "#8B5CF6" },
        { name: "Water", value: counts.Water, color: "#06B6D4" },
        { name: "Safety", value: counts.Safety, color: "#10B981" },
        { name: "Other", value: counts.Other, color: "#64748B" },
      ]);
    }
    fetchIssueTypeCounts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">City Insights & Heatmaps</h1>
              <p className="text-blue-100">Real-time civic data visualization</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3 justify-end">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {issueTypeData.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                  <div className="text-blue-100 text-xs">Total Reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Heatmap */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold">City Heatmap</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Interactive civic issue visualization</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Map Layer Controls */}
              <div className="flex flex-wrap gap-3 mb-6 p-6 pb-0">
                {mapLayers.map((layer) => (
                  <Button
                    key={layer.id}
                    variant={selectedLayer === layer.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedLayer === layer.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2 shadow-sm" 
                      style={{ backgroundColor: layer.color }}
                    />
                    {layer.label}
                  </Button>
                ))}
              </div>
              <div className="w-full relative rounded-b-lg overflow-hidden">
                <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="w-full h-[600px] min-h-[600px]">
                  <TileLayer url={tileUrl} attribution={tileAttribution} />
                  <HeatLayer points={heatmapData} />
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">Live Statistics</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Real-time metrics</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reports</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">1,247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Resolved</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">1,089</span>
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">158</span>
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg. Resolution</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3.2 days</span>
                  <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                  <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">Issue Types</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Distribution breakdown</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issueTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {issueTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(30 41 59)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-6">
                {issueTypeData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Performance */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Department Resolution Rates</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Performance metrics by department</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {departmentData.map((dept, index) => (
              <div 
                key={dept.department} 
                className="text-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-3">
                  <div className={`text-3xl font-bold ${getResolutionColor(getResolutionRate(dept.resolved, dept.total))}`}>
                    {getResolutionRate(dept.resolved, dept.total)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {dept.resolved}/{dept.total}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {dept.department}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Monthly Trends</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Reports vs resolution over time</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="month" 
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12, fontWeight: 500 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  padding: '12px 16px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                strokeWidth={4}
                name="Reports"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10B981" 
                strokeWidth={4}
                name="Resolved"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Heatmaps;
