
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Calendar,
  Folder,
  ChevronDown,
  ChevronRight,
  Pin,
  Zap,
  Droplets,
  Trash2,
  Building,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pinned: true,
    recent: true
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electricity", label: "Electricity" },
    { value: "water", label: "Water & Sanitation" },
    { value: "waste", label: "Waste Management" },
    { value: "transport", label: "Transportation" },
    { value: "planning", label: "Urban Planning" },
    { value: "emergency", label: "Emergency Services" }
  ];

  const pinnedDocuments = [
    {
      id: 1,
      title: "Emergency Contact Numbers",
      description: "Important phone numbers for police, fire, medical, and municipal services",
      category: "emergency",
      date: "2024-01-15",
      size: "245 KB",
      downloads: 1250,
      type: "announcement",
      urgent: true
    },
    {
      id: 2,
      title: "Water Supply Schedule - January 2024",
      description: "Updated water supply timings for all zones in the city",
      category: "water",
      date: "2024-01-10",
      size: "1.2 MB",
      downloads: 890,
      type: "document",
      urgent: false
    }
  ];

  const documents = [
    {
      id: 3,
      title: "Power Outage Schedule - January 2024",
      description: "Planned electricity maintenance and outage schedules",
      category: "electricity",
      date: "2024-01-18",
      size: "892 KB",
      downloads: 456,
      type: "document",
      urgent: false
    },
    {
      id: 4,
      title: "New Bus Route Announcements",
      description: "Additional bus routes and timings effective from February 1st",
      category: "transport",
      date: "2024-01-17",
      size: "634 KB",
      downloads: 234,
      type: "announcement",
      urgent: false
    },
    {
      id: 5,
      title: "Waste Collection Guidelines 2024",
      description: "Updated guidelines for household waste segregation and collection",
      category: "waste",
      date: "2024-01-16",
      size: "1.8 MB",
      downloads: 678,
      type: "document",
      urgent: false
    },
    {
      id: 6,
      title: "City Development Plan Draft",
      description: "Public consultation document for the 2024-2029 development plan",
      category: "planning",
      date: "2024-01-14",
      size: "5.2 MB",
      downloads: 123,
      type: "document",
      urgent: false
    },
    {
      id: 7,
      title: "Property Tax Payment Portal",
      description: "Online property tax payment system launch announcement",
      category: "planning",
      date: "2024-01-12",
      size: "345 KB",
      downloads: 567,
      type: "announcement",
      urgent: false
    },
    {
      id: 8,
      title: "Monsoon Preparedness Guidelines",
      description: "Citizen guidelines for monsoon season safety and preparedness",
      category: "emergency",
      date: "2024-01-11",
      size: "2.1 MB",
      downloads: 789,
      type: "document",
      urgent: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electricity':
        return Zap;
      case 'water':
        return Droplets;
      case 'waste':
        return Trash2;
      case 'transport':
        return Building;
      case 'planning':
        return Building;
      case 'emergency':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'electricity':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'water':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'waste':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'transport':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'planning':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'emergency':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'announcement' 
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
  };

  const allDocuments = [...pinnedDocuments, ...documents];
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const DocumentCard = ({ document, isPinned = false }: { document: any, isPinned?: boolean }) => {
    const CategoryIcon = getCategoryIcon(document.category);
    
    return (
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(document.category).replace('bg-', 'from-').replace('text-', 'to-')} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <CategoryIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {document.title}
                  </h3>
                  {isPinned && (
                    <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Pin className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {document.urgent && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {document.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`${getCategoryColor(document.category)} px-3 py-1 text-xs font-medium border-2`}>
                    {categories.find(c => c.value === document.category)?.label}
                  </Badge>
                  <Badge className={`${getTypeColor(document.type)} px-3 py-1 text-xs font-medium border-2`}>
                    {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{new Date(document.date).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg font-medium">
                {document.size}
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg font-medium">
                {document.downloads} downloads
              </div>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Documents & Announcements</h1>
              <p className="text-blue-100 text-sm">Access important civic documents and community updates</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {allDocuments.length}
                  </div>
                  <div className="text-blue-100 text-xs">Documents Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents and announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Documents */}
      <Collapsible 
        open={expandedSections.pinned} 
        onOpenChange={() => toggleSection('pinned')}
      >
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-300">
              <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                    <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Pinned Documents</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Important documents for quick access</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                    {pinnedDocuments.length}
                  </Badge>
                </div>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center transition-transform duration-300">
                  {expandedSections.pinned ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {pinnedDocuments
                .filter(doc => {
                  const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       doc.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((document, index) => (
                  <div key={document.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <DocumentCard document={document} isPinned={true} />
                  </div>
                ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Recent Documents */}
      <Collapsible 
        open={expandedSections.recent} 
        onOpenChange={() => toggleSection('recent')}
      >
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-300">
              <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Recent Documents</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Latest civic documents and announcements</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold">
                    {documents.length}
                  </Badge>
                </div>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center transition-transform duration-300">
                  {expandedSections.recent ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {documents
                .filter(doc => {
                  const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       doc.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((document, index) => (
                  <div key={document.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <DocumentCard document={document} />
                  </div>
                ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* No Results */}
      {filteredDocuments.length === 0 && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              No documents found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try adjusting your search terms or category filter to find what you're looking for.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Documents;
