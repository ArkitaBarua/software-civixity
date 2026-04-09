
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  MapPin, 
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  Trash
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, parseISO } from "date-fns";
import { usePoints } from "@/contexts/PointsContext";

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: number;
  location: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  image_url?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  badges: string[];
}

interface Story {
  id: number;
  title: string;
  location: string;
  image: string | null;
  timestamp: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  timestamp: string;
}

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const stories = [
    {
      id: 1,
      title: "Water Leak Fixed",
      location: "Oak Avenue",
      image: null,
      timestamp: "3h ago"
    },
    {
      id: 2,
      title: "New Bike Lane",
      location: "City Center",
      image: null,
      timestamp: "8h ago"
    },
    {
      id: 3,
      title: "Park Renovation",
      location: "Green Park",
      image: null,
      timestamp: "12h ago"
    },
    {
      id: 4,
      title: "Traffic Light Fixed",
      location: "5th Street",
      image: null,
      timestamp: "18h ago"
    }
  ];

  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    image: null as File | null,
    location: "",
    autoDetectLocation: false,
    category: "Potholes", // default value
    otherCategory: "",
    latitude: null,
    longitude: null,
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { addPoints, deductPoints } = usePoints();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [aiDetected, setAIDetected] = useState(false);
  const [aiDetectionChecked, setAIDetectionChecked] = useState(false);

  // Track user votes per post in localStorage
  const [userVotes, setUserVotes] = useState<{ [postId: number]: 'up' | 'down' | null }>({});

  useEffect(() => {
    const storedVotes = localStorage.getItem('userVotes');
    if (storedVotes) {
      setUserVotes(JSON.parse(storedVotes));
    }
  }, []);

  // Handle auto-detect location
  useEffect(() => {
    if (newPost.autoDetectLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Call Nominatim API for reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setNewPost((prev) => ({
              ...prev,
              location: data.display_name || "Location unavailable",
              latitude,
              longitude,
            }));
          } catch (err) {
            setNewPost((prev) => ({ ...prev, location: "Location unavailable", latitude, longitude }));
          }
        },
        (err) => {
          setNewPost((prev) => ({ ...prev, location: "Location unavailable", latitude: null, longitude: null }));
        }
      );
    }
  }, [newPost.autoDetectLocation]);

  // Fetch posts from Supabase on mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Handle image file selection
  // [TC_CVX_014] Image upload should trigger authenticity detection and reflect UI state
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPost({ ...newPost, image: file });
      // AI detection
      const formData = new FormData();
      formData.append('image', file);
      try {
        // [TC_CVX_004] Call backend detection API
        const response = await fetch('http://localhost:4000/api/detect-image', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        setAIDetectionChecked(true);
        if (data.result === 'AI') {
          setAIDetected(true);
        } else {
          setAIDetected(false);
        }
      } catch (err) {
        setAIDetectionChecked(true);
        setAIDetected(false);
        console.error('AI detection error', err);
      }
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("arkita");
  const [postAnonymous, setPostAnonymous] = useState(false);

  // Fetch user after login
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  // Handle new post submission
  // [TC_CVX_017] Validation blocks empty inputs; [TC_CVX_014] Successful submit shows toast and updates feed
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = null;
    if (newPost.image) {
      const fileExt = newPost.image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('post-images')
        .upload(fileName, newPost.image);
      if (storageError) {
        alert('Image upload failed: ' + storageError.message);
      }
      if (!storageError && storageData) {
        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from('post-images')
          .getPublicUrl(storageData.path);
        if (publicUrlError) {
          console.error('Error getting public URL:', publicUrlError);
        }
        imageUrl = publicUrlData?.publicUrl || null;
      }
    }
    // Determine final category
    const finalCategory = newPost.category === 'Other' && newPost.otherCategory.trim() ? `Other: ${newPost.otherCategory.trim()}` : newPost.category;
    // Determine username for post
    const postUsername = postAnonymous ? 'Anonymous' : username;
    // Insert post into Supabase
    const { error: insertError } = await supabase.from('posts').insert([
      {
        title: newPost.title,
        description: newPost.description,
        author: postUsername,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        location: newPost.location,
        category: finalCategory,
        severity: 5, // Optionally add severity input
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        image_url: imageUrl,
        similar_posts: 0,
        ai_detected: false,
        latitude: newPost.latitude,
        longitude: newPost.longitude,
      }
    ]);
    setUploading(false);
    if (!insertError) {
      // Add 30 points for posting a report
      addPoints(30);
      setNewPost({ title: "", description: "", image: null, location: "", autoDetectLocation: false, category: "Potholes", otherCategory: "", latitude: null, longitude: null });
      setDialogOpen(false);
      setPostAnonymous(false);
      toast({ title: "Posted!", description: "Your report has been submitted. +30 points earned!" });
      // Refetch posts
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        setPosts(data);
      }
    } else {
      alert('Post creation failed: ' + insertError.message);
    }
  };

  const handleVote = async (postId: number, type: 'up' | 'down') => {
    const prevVote = userVotes[postId];
    if (prevVote === type) return; // Already voted this way

    // Find the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Check if user is voting on their own post
    const isOwnPost = post.user_id === user?.id;

    let upvotes = post.upvotes;
    let downvotes = post.downvotes;
    if (type === 'up') {
      upvotes += 1;
      if (prevVote === 'down') downvotes = Math.max(0, downvotes - 1);
    } else if (type === 'down') {
      downvotes += 1;
      if (prevVote === 'up') upvotes = Math.max(0, upvotes - 1);
    }

    // Update in Supabase
    await supabase
      .from('posts')
      .update({ upvotes, downvotes })
      .eq('id', postId);

    // Update local state
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, upvotes, downvotes } : p
    ));
    const newVotes = { ...userVotes, [postId]: type };
    setUserVotes(newVotes);
    localStorage.setItem('userVotes', JSON.stringify(newVotes));

    // Add 5 points for voting on someone else's post
    if (!isOwnPost) {
      addPoints(5);
      toast({ title: "Vote recorded!", description: `+5 points for ${type === 'up' ? 'upvoting' : 'downvoting'} this post!` });
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Handle deleting a post
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    // Find the post to check if it belongs to the current user
    const post = posts.find(p => p.id === postToDelete);
    const isOwnPost = post && post.user_id === user?.id;
    
    const { error } = await supabase.from('posts').delete().eq('id', postToDelete);
    if (!error) {
      setPosts(posts.filter(p => p.id !== postToDelete));
      
      // Deduct 30 points if user is deleting their own post
      if (isOwnPost) {
        deductPoints(30);
        toast({ title: "Deleted", description: "Your post has been deleted. -30 points deducted." });
      } else {
        toast({ title: "Deleted", description: "Your post has been deleted." });
      }
    } else {
      toast({ title: "Error", description: "Failed to delete post." });
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (severity >= 6) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 8) return "Urgent";
    if (severity >= 6) return "Moderate";
    return "Low Priority";
  };

  const categoryColors: { [key: string]: string } = {
    "Potholes": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    "Water Issues": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    "Street Lighting": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "Garbage": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    "Public Safety": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    // For custom 'Other' categories, use a default color
    "Other": "bg-slate-200 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300"
  };

  function getCategoryColor(category: string) {
    if (category.startsWith("Other:")) return categoryColors["Other"];
    return categoryColors[category] || "bg-slate-200 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300";
  }

  // Helper to get top 5 severe posts from last 24 hours
  const topSeverePosts = useMemo(() => {
    const now = new Date();
    return posts
      .filter(post => {
        if (!post.timestamp) return false;
        const postTime = new Date(post.timestamp);
        return (now.getTime() - postTime.getTime()) < 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5);
  }, [posts]);

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', String(postId))
      .order('created_at', { ascending: true });
    if (!error) {
      setComments(prev => ({ ...prev, [postId]: data }));
      setCommentCounts(prev => ({ ...prev, [postId]: data.length }));
      console.log('Fetched comments for', postId, data);
    } else {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch comments when posts are loaded
  useEffect(() => {
    posts.forEach(post => {
      fetchComments(String(post.id));
    });
  }, [posts]);

  // Add a comment
  const handleAddComment = async (postId: string) => {
    if (!newComment[postId]?.trim()) return;
    console.log('Inserting comment for postId:', postId);
    const { error } = await supabase.from('comments').insert([{
      post_id: postId,
      user_id: user?.id,
      author: username || user?.email || 'Anonymous',
      content: newComment[postId],
    }]);
    if (error) {
      console.error('Insert comment error:', error);
    }
    if (!error) {
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      setCommentCounts(prev => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 1) - 1)
      }));
      toast({ title: "Deleted", description: "Your comment has been deleted." });
    } else {
      toast({ title: "Error", description: "Failed to delete comment." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Hero Section with Gradient Background */}
      {/* <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Civic Engagement Hub</h1>
          <p className="text-blue-100 text-lg">Connect with your community and make a difference</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div> */}

      {/* Stories Section */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            Recent Updates (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {topSeverePosts.map((post, index) => (
              <div
                key={post.id}
                className="flex-shrink-0 w-36 cursor-pointer group transform hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedStory(post)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Show image if available */}
                {post.image_url && post.image_url !== 'null' && post.image_url !== '' ? (
                  <div className="w-24 h-24 mb-2 mx-auto rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
                    <img
                      src={post.image_url}
                      alt="Story"
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
                    <MapPin className="h-10 w-10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {post.location}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {post.timestamp ? formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true }) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Story Popup Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={open => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-800">
          {selectedStory && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {selectedStory.author?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedStory.author}</div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{selectedStory.timestamp ? formatDistanceToNow(parseISO(selectedStory.timestamp), { addSuffix: true }) : ''}</span>
                    <MapPin className="h-3 w-3 ml-2" />
                    <span>{selectedStory.location}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{selectedStory.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">{selectedStory.description}</p>
              {selectedStory.image_url && selectedStory.image_url !== 'null' && selectedStory.image_url !== '' && (
                <img
                  src={selectedStory.image_url}
                  alt="Post"
                  className="mb-3 rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: 350, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                />
              )}
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className={getCategoryColor(selectedStory.category)}>
                  {selectedStory.category}
                </Badge>
                <Badge className={getSeverityColor(selectedStory.severity)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {getSeverityLabel(selectedStory.severity)} ({selectedStory.severity}/10)
                </Badge>
              </div>
              {/* Post Actions in Popup */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 mt-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-green-600 dark:text-green-400"><ThumbsUp className="h-4 w-4 mr-1" />{selectedStory.upvotes}</span>
                  <span className="flex items-center text-red-600 dark:text-red-400"><ThumbsDown className="h-4 w-4 mr-1" />{selectedStory.downvotes}</span>
                  <span className="flex items-center text-blue-600 dark:text-blue-400"><MessageCircle className="h-4 w-4 mr-1" />{selectedStory.comments}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Post */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    Report a New Issue
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Help improve your community by reporting civic issues
                  </div>
                </div>
                <Camera className="h-6 w-6 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm max-w-lg border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Report New Issue
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Issue Title</Label>
              <Input 
                id="title"
                placeholder="Brief description of the issue"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea 
                id="description"
                placeholder="Provide more details about the issue"
                value={newPost.description}
                onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 transition-all duration-200"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location or use auto-detect"
                value={newPost.location}
                onChange={(e) => setNewPost({ ...newPost, location: e.target.value, autoDetectLocation: false })}
                className="bg-white dark:bg-slate-700"
                disabled={newPost.autoDetectLocation}
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="autoDetectLocation"
                  checked={newPost.autoDetectLocation}
                  onChange={(e) => setNewPost({ ...newPost, autoDetectLocation: e.target.checked })}
                  className="mr-2"
                />
                <Label htmlFor="autoDetectLocation">Detect my location automatically</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newPost.category}
                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                className="bg-white dark:bg-slate-700 w-full rounded border px-3 py-2"
                required
              >
                <option value="Potholes">Potholes</option>
                <option value="Water Issues">Water Issues</option>
                <option value="Street Lighting">Street Lighting</option>
                <option value="Garbage">Garbage</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Other">Other</option>
              </select>
              {newPost.category === 'Other' && (
                <Input
                  id="otherCategory"
                  placeholder="Please specify the issue type in 1-2 words"
                  value={newPost.otherCategory}
                  onChange={e => setNewPost({ ...newPost, otherCategory: e.target.value })}
                  className="bg-white dark:bg-slate-700 mt-2"
                  required
                />
              )}
            </div>
            <div>
              <Label htmlFor="image">Photo (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input type="file" accept="image/*" id="image" onChange={handleImageChange} />
              </div>
              {aiDetectionChecked && aiDetected && (
                <div className="mt-2 p-3 border-2 border-red-600 bg-red-50 text-red-700 rounded">
                  <strong>Warning:</strong> The image you uploaded appears to be <span className="font-bold">AI-generated</span>. Please upload a real, time-taken image for your report.
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="postAnonymous"
                checked={postAnonymous}
                onChange={e => setPostAnonymous(e.target.checked)}
                className="mr-2"
              />
              <Label htmlFor="postAnonymous">Post as anonymous</Label>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
              type="submit" 
              disabled={uploading || aiDetected}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Report'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Detection Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-generated Image Detected</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-slate-700 dark:text-slate-300">
            The image you uploaded appears to be AI-generated. Please upload a real, time-taken image for your report.
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAIDialogOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Civic Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              Loading posts...
            </div>
          </div>
        ) : (
          posts.map((post, index) => (
            <Card 
              key={post.id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
                              <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-6 relative">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12 ring-2 ring-purple-100 dark:ring-purple-900/30 group-hover:ring-purple-200 dark:group-hover:ring-purple-800/50 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-lg">{post.author}</div>
                        <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.timestamp ? formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true }) : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  {post.ai_detected && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      AI Detected
                    </Badge>
                  )}
                 {post.user_id && user?.id && post.user_id === user.id && (
                    <button
                      onClick={() => { setDeleteDialogOpen(true); setPostToDelete(post.id); }}
                      className="absolute -top-2 right-2 p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group/delete"
                      title="Delete post"
                    >
                      <Trash className="h-4 w-4 group-hover/delete:rotate-12 transition-transform" />
                    </button>
                  )}
                </div>

                                  {/* Post Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 text-base leading-relaxed">
                      {post.description}
                    </p>
                    {post.image_url && post.image_url !== 'null' && post.image_url !== '' ? (
                      <div className="mb-4 overflow-hidden rounded-xl">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : null}
                    
                    {/* Tags and Severity */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge variant="outline" className={`${getCategoryColor(post.category)} px-3 py-1 text-sm font-medium border-2`}>
                        {post.category}
                      </Badge>
                      <Badge className={`${getSeverityColor(post.severity)} px-3 py-1 text-sm font-medium`}>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {getSeverityLabel(post.severity)} ({post.severity}/10)
                      </Badge>
                    </div>

                  {/* Similar Posts */}
                  {post.similar_posts > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700 dark:text-amber-300">
                          {post.similar_posts} similar report{post.similar_posts > 1 ? 's' : ''} found in this area
                        </span>
                        <Button variant="link" className="text-amber-700 dark:text-amber-300 p-0 h-auto">
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleVote(post.id, 'up')}
                      className={
                        (userVotes[post.id] === 'up'
                          ? 'bg-green-100 border-2 border-green-300 dark:bg-green-900/40 dark:border-green-600 shadow-lg'
                          : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 hover:shadow-md') +
                        ' flex items-center px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105'
                      }
                      disabled={userVotes[post.id] === 'up'}
                    >
                      <ThumbsUp className={
                        `h-5 w-5 mr-2 ${userVotes[post.id] === 'up' ? 'text-green-700 dark:text-green-300' : 'text-green-600 dark:text-green-400'}`
                      } />
                      <span className={`font-semibold ${userVotes[post.id] === 'up' ? 'text-green-700 dark:text-green-300' : 'text-green-600 dark:text-green-400'}`}>
                        {post.upvotes}
                      </span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleVote(post.id, 'down')}
                      className={
                        (userVotes[post.id] === 'down'
                          ? 'bg-red-100 border-2 border-red-300 dark:bg-red-900/40 dark:border-red-600 shadow-lg'
                          : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 hover:shadow-md') +
                        ' flex items-center px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105'
                      }
                      disabled={userVotes[post.id] === 'down'}
                    >
                      <ThumbsDown className={
                        `h-5 w-5 mr-2 ${userVotes[post.id] === 'down' ? 'text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'}`
                      } />
                      <span className={`font-semibold ${userVotes[post.id] === 'down' ? 'text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'}`}>
                        {post.downvotes}
                      </span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                      onClick={() => setExpandedComments(prev => ({ ...prev, [String(post.id)]: !prev[String(post.id)] }))}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span className="font-semibold">{commentCounts[String(post.id)] || 0}</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[String(post.id)] && (
                  <div className="mt-6 animate-fade-in-up">
                    <div className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      Comments ({commentCounts[String(post.id)] || 0})
                    </div>
                    <div className="space-y-3 mb-4">
                      {(comments[String(post.id)] || []).map(comment => (
                        <div key={comment.id} className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 relative hover-lift border border-slate-200/50 dark:border-slate-600/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              {comment.author} • {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : ''}
                            </div>
                            {comment.user_id === user?.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, String(post.id))}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110"
                                title="Delete comment"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="text-slate-900 dark:text-white text-base leading-relaxed">{comment.content}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        value={newComment[String(post.id)] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [String(post.id)]: e.target.value }))}
                        placeholder="Share your thoughts..."
                        className="flex-1 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                      />
                      <Button 
                        onClick={() => handleAddComment(String(post.id))} 
                        disabled={!newComment[String(post.id)]?.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={open => { setDeleteDialogOpen(open); if (!open) setPostToDelete(null); }}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Trash className="h-4 w-4 text-white" />
              </div>
              Delete Post
            </DialogTitle>
          </DialogHeader>
          <div className="mb-6 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            Are you sure you want to delete this post? This action cannot be undone and you will lose 30 points.
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => { setDeleteDialogOpen(false); setPostToDelete(null); }}
              className="px-6 py-2 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={handleDeletePost}
            >
              Delete Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
