
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Coins, 
  Search, 
  Filter,
  Car,
  Utensils,
  ShoppingBag,
  Zap,
  Coffee,
  Film,
  Heart,
  Globe,
  Leaf,
  BookOpen,
  Shield,
  Droplets,
  Users,
  Baby,
  Eye,
  Brain,
  Home,
  Download,
  Copy,
  CheckCircle,
  Clock,
  MapPin,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Star
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { usePoints } from "@/contexts/PointsContext";

const RedeemPoints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNgoSection, setShowNgoSection] = useState(false);
  const [donationDialog, setDonationDialog] = useState<{
    open: boolean;
    ngo: any;
    points: number;
  }>({ open: false, ngo: null, points: 0 });
  const [donationAmount, setDonationAmount] = useState("");
  const [redemptionDialog, setRedemptionDialog] = useState<{
    open: boolean;
    offer: any;
  }>({ open: false, offer: null });
  const [redemptionSuccess, setRedemptionSuccess] = useState<{
    open: boolean;
    voucher: any;
  }>({ open: false, voucher: null });
  const [userRedemptions, setUserRedemptions] = useState<any[]>([]);
  const [userDonations, setUserDonations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const { toast } = useToast();
  const { userPoints, deductPoints } = usePoints();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchUserRedemptions(user.id);
        fetchUserDonations(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch user's redemption history
  const fetchUserRedemptions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setUserRedemptions(data);
      } else {
        // Fallback to localStorage if table doesn't exist
        const localRedemptions = localStorage.getItem(`redemptions_${userId}`);
        if (localRedemptions) {
          setUserRedemptions(JSON.parse(localRedemptions));
        }
      }
    } catch (error) {
      console.log('Using localStorage fallback for redemptions');
      // Fallback to localStorage
      const localRedemptions = localStorage.getItem(`redemptions_${userId}`);
      if (localRedemptions) {
        setUserRedemptions(JSON.parse(localRedemptions));
      }
    }
  };

  // Fetch user's donation history
  const fetchUserDonations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setUserDonations(data);
      } else {
        // Fallback to localStorage if table doesn't exist
        const localDonations = localStorage.getItem(`donations_${userId}`);
        if (localDonations) {
          setUserDonations(JSON.parse(localDonations));
        }
      }
    } catch (error) {
      console.log('Using localStorage fallback for donations');
      // Fallback to localStorage
      const localDonations = localStorage.getItem(`donations_${userId}`);
      if (localDonations) {
        setUserDonations(JSON.parse(localDonations));
      }
    }
  };

  const offers = [
    {
      id: 1,
      title: "Metro Card - 10 Rides",
      description: "Get 10 free metro rides with this transport voucher",
      brand: "City Metro",
      points: 200,
      category: "transport",
      icon: Car,
      discount: "Worth ₹100",
      type: "voucher",
      validity: "3 months",
      locations: ["All metro stations"],
      terms: "Valid for 10 rides on any metro line. Non-transferable.",
      redemptionCode: "METRO10",
      partnerId: "metro_city"
    },
    {
      id: 2,
      title: "Municipal Tax Discount",
      description: "5% discount on your next municipal tax payment",
      brand: "City Hall",
      points: 500,
      category: "utilities",
      icon: Zap,
      discount: "5% Off",
      type: "discount",
      validity: "6 months",
      locations: ["Online portal", "City Hall"],
      terms: "Apply discount code during tax payment. Maximum discount ₹500.",
      redemptionCode: "TAX5OFF",
      partnerId: "municipal_gov"
    },
    {
      id: 3,
      title: "Local Restaurant Voucher",
      description: "₹250 voucher for participating local restaurants",
      brand: "FoodieHub",
      points: 400,
      category: "food",
      icon: Utensils,
      discount: "₹250 Value",
      type: "voucher",
      validity: "2 months",
      locations: ["50+ partner restaurants"],
      terms: "Valid at participating restaurants. Minimum order ₹500.",
      redemptionCode: "FOOD250",
      partnerId: "foodiehub"
    },
    {
      id: 4,
      title: "Coffee Shop Credits",
      description: "Free coffee voucher at partner coffee shops",
      brand: "Bean & Brew",
      points: 150,
      category: "food",
      icon: Coffee,
      discount: "Free Coffee",
      type: "voucher",
      validity: "1 month",
      locations: ["15+ coffee shops"],
      terms: "Valid for any coffee drink. Cannot be combined with other offers.",
      redemptionCode: "COFFEE1",
      partnerId: "bean_brew"
    },
    {
      id: 5,
      title: "Shopping Mall Discount",
      description: "10% discount at City Center Mall",
      brand: "City Center",
      points: 300,
      category: "shopping",
      icon: ShoppingBag,
      discount: "10% Off",
      type: "discount",
      validity: "1 month",
      locations: ["City Center Mall"],
      terms: "Valid on purchases above ₹1000. Excludes electronics and food.",
      redemptionCode: "MALL10",
      partnerId: "city_center"
    },
    {
      id: 6,
      title: "Movie Theater Tickets",
      description: "Buy 1 Get 1 free movie tickets",
      brand: "CineMax",
      points: 350,
      category: "entertainment",
      icon: Film,
      discount: "BOGO",
      type: "voucher",
      validity: "2 months",
      locations: ["CineMax theaters"],
      terms: "Valid for any movie. Subject to availability. Cannot be used on holidays.",
      redemptionCode: "MOVIEBOGO",
      partnerId: "cinemax"
    },
    {
      id: 7,
      title: "Bus Pass - Monthly",
      description: "One month unlimited city bus travel",
      brand: "City Transport",
      points: 800,
      category: "transport",
      icon: Car,
      discount: "Worth ₹500",
      type: "pass",
      validity: "1 month from activation",
      locations: ["All bus routes"],
      terms: "Unlimited travel on all city bus routes. Photo ID required for activation.",
      redemptionCode: "BUSPASS",
      partnerId: "city_transport"
    },
    {
      id: 8,
      title: "Electricity Bill Discount",
      description: "₹100 credit on your next electricity bill",
      brand: "Power Grid",
      points: 250,
      category: "utilities",
      icon: Zap,
      discount: "₹100 Credit",
      type: "credit",
      validity: "3 months",
      locations: ["Online portal", "Service centers"],
      terms: "Credit will be applied to your next electricity bill. Non-refundable.",
      redemptionCode: "POWER100",
      partnerId: "power_grid"
    }
  ];

  const ngos = [
    {
      id: 1,
      name: "Green Earth Foundation",
      description: "Environmental conservation and tree planting initiatives",
      category: "environment",
      icon: Leaf,
      pointsToDonation: 100, // 100 points = ₹50 donation
      minPoints: 50,
      maxPoints: 1000,
      impact: "Plant 1 tree for every ₹50 donated",
      verified: true,
      rating: 4.8,
      totalDonations: 15420,
      color: "from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50"
    },
    {
      id: 2,
      name: "Clean Water Initiative",
      description: "Providing clean drinking water to rural communities",
      category: "health",
      icon: Droplets,
      pointsToDonation: 80, // 80 points = ₹40 donation
      minPoints: 40,
      maxPoints: 800,
      impact: "Provide clean water to 1 family for a month",
      verified: true,
      rating: 4.9,
      totalDonations: 22340,
      color: "from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50"
    },
    {
      id: 3,
      name: "Education for All",
      description: "Supporting underprivileged children's education",
      category: "education",
      icon: BookOpen,
      pointsToDonation: 120, // 120 points = ₹60 donation
      minPoints: 60,
      maxPoints: 1200,
      impact: "Provide school supplies for 1 child",
      verified: true,
      rating: 4.7,
      totalDonations: 18950,
      color: "from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50"
    },
    {
      id: 4,
      name: "Animal Welfare Society",
      description: "Rescuing and caring for stray animals",
      category: "animals",
      icon: Heart,
      pointsToDonation: 60, // 60 points = ₹30 donation
      minPoints: 30,
      maxPoints: 600,
      impact: "Feed 1 stray animal for a week",
      verified: true,
      rating: 4.6,
      totalDonations: 9870,
      color: "from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50"
    },
    {
      id: 5,
      name: "Digital Literacy Program",
      description: "Teaching computer skills to rural communities",
      category: "education",
      icon: Brain,
      pointsToDonation: 150, // 150 points = ₹75 donation
      minPoints: 75,
      maxPoints: 1500,
      impact: "Train 1 person in basic computer skills",
      verified: true,
      rating: 4.5,
      totalDonations: 12340,
      color: "from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50"
    },
    {
      id: 6,
      name: "Women Empowerment Network",
      description: "Supporting women's education and entrepreneurship",
      category: "social",
      icon: Users,
      pointsToDonation: 200, // 200 points = ₹100 donation
      minPoints: 100,
      maxPoints: 2000,
      impact: "Support 1 woman's vocational training",
      verified: true,
      rating: 4.8,
      totalDonations: 16780,
      color: "from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50"
    },
    {
      id: 7,
      name: "Child Healthcare Foundation",
      description: "Providing healthcare for underprivileged children",
      category: "health",
      icon: Baby,
      pointsToDonation: 180, // 180 points = ₹90 donation
      minPoints: 90,
      maxPoints: 1800,
      impact: "Provide healthcare for 1 child for a month",
      verified: true,
      rating: 4.9,
      totalDonations: 20150,
      color: "from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50"
    },
    {
      id: 8,
      name: "Disability Support Alliance",
      description: "Supporting people with disabilities",
      category: "social",
      icon: Eye,
      pointsToDonation: 160, // 160 points = ₹80 donation
      minPoints: 80,
      maxPoints: 1600,
      impact: "Provide assistive devices for 1 person",
      verified: true,
      rating: 4.7,
      totalDonations: 14560,
      color: "from-lime-100 to-green-100 dark:from-lime-900/50 dark:to-green-900/50"
    },
    {
      id: 9,
      name: "Disaster Relief Fund",
      description: "Emergency response and disaster relief",
      category: "emergency",
      icon: Shield,
      pointsToDonation: 100, // 100 points = ₹50 donation
      minPoints: 50,
      maxPoints: 1000,
      impact: "Provide emergency relief to 1 family",
      verified: true,
      rating: 4.8,
      totalDonations: 28940,
      color: "from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50"
    },
    {
      id: 10,
      name: "Housing for Homeless",
      description: "Building shelters and homes for homeless families",
      category: "social",
      icon: Home,
      pointsToDonation: 300, // 300 points = ₹150 donation
      minPoints: 150,
      maxPoints: 3000,
      impact: "Provide temporary shelter for 1 family",
      verified: true,
      rating: 4.6,
      totalDonations: 11230,
      color: "from-gray-100 to-slate-100 dark:from-gray-900/50 dark:to-slate-900/50"
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "transport", label: "Transport" },
    { value: "utilities", label: "Utilities" },
    { value: "food", label: "Food & Dining" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" }
  ];

  const ngoCategories = [
    { value: "all", label: "All Causes" },
    { value: "environment", label: "Environment" },
    { value: "health", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "animals", label: "Animal Welfare" },
    { value: "social", label: "Social Causes" },
    { value: "emergency", label: "Emergency Relief" }
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ngo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transport':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'utilities':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'food':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'shopping':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'entertainment':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'environment':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'health':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'education':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'animals':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'social':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'emergency':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const canAfford = (points: number) => userPoints >= points;

  const calculateDonationAmount = (points: number, ngo: any) => {
    return (points / ngo.pointsToDonation) * (ngo.pointsToDonation / 2); // Convert to rupees
  };

  const handleDonationClick = (ngo: any) => {
    setDonationDialog({ open: true, ngo, points: ngo.minPoints });
    setDonationAmount(ngo.minPoints.toString());
  };

  const handleDonationConfirm = async () => {
    const points = parseInt(donationAmount) || 0;
    if (points < donationDialog.ngo.minPoints || points > donationDialog.ngo.maxPoints) {
      toast({
        title: "Invalid donation amount",
        description: `Please enter between ${donationDialog.ngo.minPoints} and ${donationDialog.ngo.maxPoints} points.`,
        variant: "destructive"
      });
      return;
    }

    if (!canAfford(points)) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough CIVI points for this donation.",
        variant: "destructive"
      });
      return;
    }

    // Process donation
    deductPoints(points);
    const donationValue = calculateDonationAmount(points, donationDialog.ngo);
    
    // Save donation record
    const donationRecord = {
      id: Date.now().toString(),
      user_id: user.id,
      ngo_id: donationDialog.ngo.id,
      ngo_name: donationDialog.ngo.name,
      ngo_category: donationDialog.ngo.category,
      points_donated: points,
      donation_amount: donationValue,
      impact: donationDialog.ngo.impact,
      created_at: new Date().toISOString()
    };

    // Try to save to database first
    try {
      const { error: donationError } = await supabase
        .from('donations')
        .insert([donationRecord]);

      if (donationError) {
        throw donationError;
      }
    } catch (dbError) {
      console.log('Database save failed, using localStorage fallback for donation');
      // Fallback to localStorage
      const existingDonations = localStorage.getItem(`donations_${user.id}`) || '[]';
      const donations = JSON.parse(existingDonations);
      donations.unshift(donationRecord);
      localStorage.setItem(`donations_${user.id}`, JSON.stringify(donations));
    }

    // Refresh donations
    await fetchUserDonations(user.id);
    
    toast({
      title: "Donation successful!",
      description: `You donated ${points} CIVI points (₹${donationValue}) to ${donationDialog.ngo.name}. Thank you for your generosity!`,
    });

    setDonationDialog({ open: false, ngo: null, points: 0 });
    setDonationAmount("");
  };

  const handleRedeemOffer = (offer: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to redeem offers.",
        variant: "destructive"
      });
      return;
    }

    if (!canAfford(offer.points)) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough CIVI points for this offer.",
        variant: "destructive"
      });
      return;
    }

    setRedemptionDialog({ open: true, offer });
  };

  const handleRedemptionConfirm = async () => {
    const offer = redemptionDialog.offer;
    
    try {
      // Generate unique voucher code
      const voucherCode = `${offer.redemptionCode}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Create redemption record
      const redemptionRecord = {
        id: Date.now().toString(),
        user_id: user.id,
        offer_id: offer.id,
        offer_title: offer.title,
        offer_brand: offer.brand,
        points_spent: offer.points,
        voucher_code: voucherCode,
        redemption_type: offer.type,
        validity_period: offer.validity,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + getValidityInDays(offer.validity) * 24 * 60 * 60 * 1000).toISOString()
      };

      // Try to save to database first
      try {
        const { error: redemptionError } = await supabase
          .from('redemptions')
          .insert([redemptionRecord]);

        if (redemptionError) {
          throw redemptionError;
        }
      } catch (dbError) {
        console.log('Database save failed, using localStorage fallback');
        // Fallback to localStorage
        const existingRedemptions = localStorage.getItem(`redemptions_${user.id}`) || '[]';
        const redemptions = JSON.parse(existingRedemptions);
        redemptions.unshift(redemptionRecord);
        localStorage.setItem(`redemptions_${user.id}`, JSON.stringify(redemptions));
      }

      // Update user balance
      deductPoints(offer.points);

      // Create voucher object
      const voucher = {
        code: voucherCode,
        offer: offer,
        redeemedAt: new Date(),
        expiresAt: new Date(Date.now() + getValidityInDays(offer.validity) * 24 * 60 * 60 * 1000),
        status: 'active'
      };

      // Show success dialog
      setRedemptionSuccess({ open: true, voucher });
      setRedemptionDialog({ open: false, offer: null });

      // Refresh user redemptions and donations
      await fetchUserRedemptions(user.id);
      await fetchUserDonations(user.id);

      toast({
        title: "Redemption successful!",
        description: `Successfully redeemed ${offer.points} CIVI points for ${offer.title}.`,
      });

    } catch (error) {
      console.error('Redemption error:', error);
      toast({
        title: "Redemption failed",
        description: "There was an error processing your redemption. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getValidityInDays = (validity: string) => {
    const validityMap: { [key: string]: number } = {
      "1 month": 30,
      "2 months": 60,
      "3 months": 90,
      "6 months": 180,
      "1 month from activation": 30
    };
    return validityMap[validity] || 30;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Voucher code copied to clipboard.",
    });
  };

  const downloadVoucher = (voucher: any) => {
    const voucherData = {
      code: voucher.code,
      offer: voucher.offer.title,
      brand: voucher.offer.brand,
      validity: voucher.offer.validity,
      terms: voucher.offer.terms,
      locations: voucher.offer.locations.join(', '),
      redeemedAt: voucher.redeemedAt.toLocaleDateString(),
      expiresAt: voucher.expiresAt.toLocaleDateString()
    };

    const blob = new Blob([JSON.stringify(voucherData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher-${voucher.code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Voucher downloaded!",
      description: "Your voucher has been saved to your device.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Redeem Your CIVI Points</h1>
              <p className="text-yellow-100">Exchange points for benefits or donate to causes</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3 justify-end">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-yellow-100 text-xs">CIVI Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Toggle between Offers and NGO Donations */}
      <div className="flex space-x-3">
        <Button
          variant={!showNgoSection ? "default" : "outline"}
          onClick={() => setShowNgoSection(false)}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            !showNgoSection 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl' 
              : 'border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <div className="w-6 h-6 bg-white/20 dark:bg-slate-800/50 rounded-lg flex items-center justify-center mr-2">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">Rewards & Offers</div>
            <div className="text-xs opacity-80">Exchange for benefits</div>
          </div>
        </Button>
        <Button
          variant={showNgoSection ? "default" : "outline"}
          onClick={() => setShowNgoSection(true)}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            showNgoSection 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl' 
              : 'border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <div className="w-6 h-6 bg-white/20 dark:bg-slate-800/50 rounded-lg flex items-center justify-center mr-2">
            <Heart className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">NGO Donations</div>
            <div className="text-xs opacity-80">Support causes</div>
          </div>
        </Button>
      </div>

      {/* Recent Activity Toggle */}
      {(userRedemptions.length > 0 || userDonations.length > 0) && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Redemption & donation history</div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold">
                  {userRedemptions.length + userDonations.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecentActivity(!showRecentActivity)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
              >
                {showRecentActivity ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          {showRecentActivity && (
            <CardContent>
              <div className="space-y-3">
                {/* Combine and sort redemptions and donations by date */}
                {[...userRedemptions.map(r => ({ ...r, type: 'redemption' })), 
                  ...userDonations.map(d => ({ ...d, type: 'donation' }))]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 3)
                  .map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'redemption' 
                              ? 'bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30' 
                              : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30'
                          }`}>
                            {activity.type === 'redemption' ? (
                              <ShoppingBag className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            ) : (
                              <Heart className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {activity.type === 'redemption' ? activity.offer_title : activity.ngo_name}
                          </span>
                          <Badge className={`text-xs font-medium border-2 ${
                            activity.type === 'redemption' 
                              ? (activity.status === 'active' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800')
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
                          }`}>
                            {activity.type === 'redemption' ? activity.status : 'Donation'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400 ml-11">
                          {activity.type === 'redemption' ? (
                            <>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Code:</span>
                                <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">{activity.voucher_code}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Coins className="h-3 w-3 text-yellow-500" />
                                <span>{activity.points_spent} pts</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Expires: {new Date(activity.expires_at).toLocaleDateString()}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center space-x-1">
                                <Coins className="h-3 w-3 text-yellow-500" />
                                <span>{activity.points_donated} pts</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">₹{activity.donation_amount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{activity.ngo_category}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {activity.type === 'donation' && (
                          <div className="mt-2 ml-11 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg inline-block">
                            <Lightbulb className="h-3 w-3 inline mr-1" />
                            {activity.impact}
                          </div>
                        )}
                      </div>
                      {activity.type === 'redemption' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(activity.voucher_code)}
                          className="hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder={showNgoSection ? "Search NGOs..." : "Search offers..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all duration-200 rounded-lg"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all duration-200 rounded-lg py-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mr-2">
              <Filter className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-300 dark:border-slate-600 rounded-lg">
            {(showNgoSection ? ngoCategories : categories).map((category) => (
              <SelectItem key={category.value} value={category.value} className="hover:bg-slate-100 dark:hover:bg-slate-700">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!showNgoSection ? (
        // Offers Section
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer, index) => (
            <Card 
              key={offer.id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <offer.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {offer.brand}
                      </h3>
                      <Badge className={`${getCategoryColor(offer.category)} text-xs font-medium border-2`} variant="secondary">
                        {categories.find(c => c.value === offer.category)?.label.split(' ')[0]}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium border-2 border-green-200 dark:border-green-800">
                    {offer.discount}
                  </Badge>
                </div>

                {/* Description Section */}
                <div className="mb-4 flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">
                    {offer.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {offer.description}
                  </p>
                </div>

                {/* Action Section */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg flex items-center justify-center">
                      <Coins className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base">
                        {offer.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    disabled={!canAfford(offer.points)}
                    onClick={() => handleRedeemOffer(offer)}
                    className={`font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                      canAfford(offer.points) 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white' 
                        : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford(offer.points) ? 'Redeem' : 'Insufficient'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // NGO Donations Section
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNgos.map((ngo, index) => (
            <Card 
              key={ngo.id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-12 h-12 bg-gradient-to-r ${ngo.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <ngo.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {ngo.name}
                      </h3>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge className={`${getCategoryColor(ngo.category)} text-xs font-medium border-2`} variant="secondary">
                          {ngoCategories.find(c => c.value === ngo.category)?.label}
                        </Badge>
                        {ngo.verified && (
                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-xs font-medium border-2 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{ngo.rating}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {ngo.totalDonations.toLocaleString()} donors
                    </p>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-4 flex-1">
                  <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed text-sm">
                    {ngo.description}
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-start">
                      <Lightbulb className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Impact: {ngo.impact}</span>
                    </p>
                  </div>
                </div>

                {/* Donation Details Section */}
                <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Points to Donation:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ngo.pointsToDonation} pts = ₹{ngo.pointsToDonation / 2}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Range:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ngo.minPoints} - {ngo.maxPoints} pts
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleDonationClick(ngo)}
                    disabled={!canAfford(ngo.minPoints)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {canAfford(ngo.minPoints) ? 'Donate Now' : 'Insufficient Points'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {((!showNgoSection && filteredOffers.length === 0) || (showNgoSection && filteredNgos.length === 0)) && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No {showNgoSection ? 'NGOs' : 'offers'} found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto text-sm">
              Try adjusting your search terms or category filter.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Donation Confirmation Dialog */}
      <Dialog open={donationDialog.open} onOpenChange={(open) => setDonationDialog({ ...donationDialog, open })}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Confirm Donation</span>
            </DialogTitle>
            <DialogDescription>
              Make a difference by donating your CIVI points to {donationDialog.ngo?.name}
            </DialogDescription>
          </DialogHeader>
          
          {donationDialog.ngo && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                  Your Impact
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {donationDialog.ngo.impact}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Points to Donate
                </label>
                <Input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min={donationDialog.ngo.minPoints}
                  max={donationDialog.ngo.maxPoints}
                  className="bg-white dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Min: {donationDialog.ngo.minPoints} pts, Max: {donationDialog.ngo.maxPoints} pts
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Estimated Donation:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    ₹{donationAmount ? calculateDonationAmount(parseInt(donationAmount), donationDialog.ngo).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDonationDialog({ open: false, ngo: null, points: 0 })}>
              Cancel
            </Button>
            <Button onClick={handleDonationConfirm} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700">
              <Heart className="h-4 w-4 mr-2" />
              Confirm Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemption Confirmation Dialog */}
      <AlertDialog open={redemptionDialog.open} onOpenChange={(open) => setRedemptionDialog({ ...redemptionDialog, open })}>
        <AlertDialogContent className="bg-white dark:bg-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-teal-500" />
              <span>Confirm Redemption</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem {redemptionDialog.offer?.points} CIVI points for this offer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {redemptionDialog.offer && (
            <div className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-teal-700 dark:text-teal-300 mb-2">
                  Offer Details
                </h4>
                <div className="space-y-2 text-sm text-teal-600 dark:text-teal-400">
                  <p><strong>Brand:</strong> {redemptionDialog.offer.brand}</p>
                  <p><strong>Type:</strong> {redemptionDialog.offer.type}</p>
                  <p><strong>Validity:</strong> {redemptionDialog.offer.validity}</p>
                  <p><strong>Locations:</strong> {redemptionDialog.offer.locations.join(', ')}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Terms:</strong> {redemptionDialog.offer.terms}
                </p>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedemptionConfirm} className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
              Confirm Redemption
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Redemption Success Dialog */}
      <Dialog open={redemptionSuccess.open} onOpenChange={(open) => setRedemptionSuccess({ ...redemptionSuccess, open })}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Redemption Successful!</span>
            </DialogTitle>
            <DialogDescription>
              Your voucher has been generated successfully.
            </DialogDescription>
          </DialogHeader>
          
          {redemptionSuccess.voucher && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                    {redemptionSuccess.voucher.code}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Voucher Code
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Offer:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{redemptionSuccess.voucher.offer.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Brand:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{redemptionSuccess.voucher.offer.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Valid Until:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{redemptionSuccess.voucher.expiresAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(redemptionSuccess.voucher.code)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadVoucher(redemptionSuccess.voucher)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>How to use:</strong> Present this code at {redemptionSuccess.voucher.offer.locations.join(' or ')} to redeem your offer.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setRedemptionSuccess({ open: false, voucher: null })} className="w-full">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedeemPoints;
