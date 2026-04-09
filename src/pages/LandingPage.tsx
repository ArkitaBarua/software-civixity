
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Brain, 
  Shield, 
  Users, 
  TrendingUp, 
  MapPin, 
  Coins,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote
} from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Google sign-in
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert(error.message);
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert(error.message);
};

const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [impactStats, setImpactStats] = useState({ reports: 0, resolved: 0, points: 0, users: 0 });
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setAuthChecked(true);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data?.username) setShowUsernameModal(true);
          else setUsername(data.username);
        });
    }
  }, [user]);

  // Animated counters
  useEffect(() => {
    const targets = { reports: 12543, resolved: 9876, points: 45231, users: 2854 };
    const duration = 2000;
    const increment = 50;

    Object.keys(targets).forEach((key) => {
      const target = targets[key as keyof typeof targets];
      const step = target / (duration / increment);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setImpactStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, increment);
    });
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Smart categorization and severity scoring of civic issues using advanced AI algorithms."
    },
    {
      icon: Shield,
      title: "Blockchain Rewards",
      description: "Earn CIVI tokens for civic participation and redeem for real-world benefits."
    },
    {
      icon: Users,
      title: "Community DAO",
      description: "Democratic voting system for prioritizing and funding civic improvement projects."
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Interactive heatmaps and insights showing civic health across your city."
    },
    {
      icon: MapPin,
      title: "GeoNFT Locations",
      description: "Unique location-based NFTs that track the history and improvements of civic spaces."
    },
    {
      icon: Coins,
      title: "Points Economy",
      description: "Gamified civic engagement with achievements, badges, and reward redemption."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Community Leader",
      content: "Civixity transformed how our neighborhood tackles local issues. The AI detection is incredibly accurate!",
      rating: 5
    },
    {
      name: "Marcus Johnson", 
      role: "City Volunteer",
      content: "I've earned over 500 CIVI tokens just by reporting potholes and attending community events.",
      rating: 5
    },
    {
      name: "Dr. Priya Patel",
      role: "Urban Planner",
      content: "The heatmap insights help us understand civic needs better than any traditional system.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleChangeAccount = async () => {
    await signOut();
    setAuthMode('signIn');
    setSignInOpen(true); // Show the sign-in modal
  };

  // Handler for email sign-in / sign-up
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (authMode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else setSignInOpen(false);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Check your email',
          description: 'A confirmation link has been sent to your inbox.',
        });
        setSignInOpen(false);
      }
    }
  };

  // Handler for Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
    // No need to close modal, as redirect will happen
  };

  const handleSetUsername = async (e) => {
    e.preventDefault();
    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
    if (existing) {
      setError('Username already taken');
      return;
    }
    // Save to profiles
    await supabase
      .from('profiles')
      .upsert({ id: user.id, username });
    setShowUsernameModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.jpg" 
                alt="Civixity Logo" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Civixity
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-0 rounded-full">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                          {user.email ? user.email[0].toUpperCase() : '?'}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleChangeAccount}>Change Account</DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setAuthMode("signIn");
                        setSignInOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white dark:bg-slate-800" aria-describedby="dialog-desc">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white">
                        {authMode === 'signIn' ? 'Sign In' : 'Sign Up'}
                      </DialogTitle>
                    </DialogHeader>
                    <p id="dialog-desc" className="sr-only">{authMode === 'signIn' ? 'Sign in to your account using email, password, or Google.' : 'Create a new account using email, password, or Google.'}</p>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white dark:bg-slate-700"
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white dark:bg-slate-700"
                        required
                      />
                      {error && <div className="text-red-500 text-sm">{error}</div>}
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600"
                        disabled={loading}
                      >
                        {loading ? (authMode === 'signIn' ? 'Signing In...' : 'Signing Up...') : (authMode === 'signIn' ? 'Sign In with Email' : 'Sign Up with Email')}
                      </Button>
                    </form>
                    <div className="text-center text-sm mt-2">
                      {authMode === 'signIn' ? (
                        <>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            onClick={() => {
                              setAuthMode('signUp');
                              setError('');
                            }}
                          >
                            Sign Up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            onClick={() => {
                              setAuthMode('signIn');
                              setError('');
                            }}
                          >
                            Sign In
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center my-4">
                      <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                      <span className="mx-2 text-slate-400 dark:text-slate-500 text-xs">OR</span>
                      <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                    </div>
                    <Button
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white flex items-center justify-center"
                      disabled={loading}
                      type="button"
                    >
                      <svg className="h-5 w-5 mr-2" /* Google icon SVG here */ />
                      {authMode === 'signIn' ? 'Sign In with Google' : 'Sign Up with Google'}
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Empower Your
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">
                Neighborhood
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-medium text-slate-600 dark:text-slate-300">
                One Report at a Time
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join the future of civic engagement with AI-powered issue reporting, 
              blockchain rewards, and community-driven solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => {
                  if (user) {
                    navigate("/platform");
                  } else {
                    setAuthMode('signIn');
                    setSignInOpen(true);
                  }
                }}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-lg px-8 py-3"
              >
                Start Reporting Issues
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-3 border-slate-300 dark:border-slate-600"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">
                {impactStats.reports.toLocaleString()}
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-1">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                {impactStats.resolved.toLocaleString()}
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-1">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                {impactStats.points.toLocaleString()}
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-1">CIVI Tokens Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {impactStats.users.toLocaleString()}
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-1">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Revolutionary Civic Technology
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Combining AI, blockchain, and community power to transform how cities work
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What Citizens Say
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Real stories from engaged community members
            </p>
          </div>
          
          <div className="relative">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="text-center">
                  <Quote className="h-8 w-8 text-teal-500 mx-auto mb-4" />
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 italic">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial 
                    ? 'bg-teal-500' 
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of citizens making their neighborhoods better, one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/platform")}
              className="bg-white text-teal-600 hover:bg-slate-100 text-lg px-8 py-3"
            >
              Start Now - It's Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600 text-lg px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/logo.jpg" 
                alt="Civixity Logo" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold">Civixity</span>
            </div>
            <div className="text-slate-400">
              © 2024 Civixity. Empowering communities through technology.
            </div>
          </div>
        </div>
      </footer>

      {user && (
        <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
          <DialogContent aria-describedby="username-desc">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Choose a Unique Username</DialogTitle>
            </DialogHeader>
            <p id="username-desc" className="sr-only">Set a unique username for your profile.</p>
            <form onSubmit={handleSetUsername} className="space-y-4">
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                required
              />
              <Button type="submit">Set Username</Button>
            </form>
            {error && <div className="text-red-500">{error}</div>}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LandingPage;
