
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Star, 
  Target, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  CheckCircle,
  Zap,
  Heart,
  Shield,
  Crown
} from "lucide-react";

const Badges = () => {
  const userStats = {
    totalReports: 127,
    eventsAttended: 15,
    upvotesEarned: 342,
    civiEarned: 1247,
    streakDays: 7
  };

  const earnedBadges = [
    {
      id: 1,
      title: "Civic Champion",
      description: "Submitted 100+ civic reports",
      icon: Award,
      color: "from-yellow-400 to-orange-500",
      earnedDate: "2024-01-15",
      rarity: "Epic"
    },
    {
      id: 2,
      title: "Community Helper",
      description: "Attended 10+ volunteer events",
      icon: Users,
      color: "from-blue-400 to-purple-500",
      earnedDate: "2024-01-10",
      rarity: "Rare"
    },
    {
      id: 3,
      title: "Neighborhood Watch",
      description: "Reported issues in 5+ different areas",
      icon: MapPin,
      color: "from-green-400 to-teal-500",
      earnedDate: "2024-01-08",
      rarity: "Common"
    },
    {
      id: 4,
      title: "Early Bird",
      description: "Active during morning hours (6-9 AM)",
      icon: Clock,
      color: "from-pink-400 to-rose-500",
      earnedDate: "2024-01-05",
      rarity: "Common"
    },
    {
      id: 5,
      title: "Influencer",
      description: "Earned 300+ upvotes on reports",
      icon: TrendingUp,
      color: "from-purple-400 to-indigo-500",
      earnedDate: "2024-01-12",
      rarity: "Rare"
    },
    {
      id: 6,
      title: "Problem Solver",
      description: "10 reported issues resolved",
      icon: CheckCircle,
      color: "from-emerald-400 to-green-500",
      earnedDate: "2024-01-18",
      rarity: "Common"
    }
  ];

  const progressBadges = [
    {
      id: 7,
      title: "Super Contributor",
      description: "Submit 200 civic reports",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      progress: (userStats.totalReports / 200) * 100,
      current: userStats.totalReports,
      target: 200,
      rarity: "Legendary"
    },
    {
      id: 8,
      title: "Event Master",
      description: "Attend 25 volunteer events",
      icon: Heart,
      color: "from-red-400 to-pink-500",
      progress: (userStats.eventsAttended / 25) * 100,
      current: userStats.eventsAttended,
      target: 25,
      rarity: "Epic"
    },
    {
      id: 9,
      title: "Guardian Angel",
      description: "Maintain 30-day reporting streak",
      icon: Shield,
      color: "from-blue-400 to-cyan-500",
      progress: (userStats.streakDays / 30) * 100,
      current: userStats.streakDays,
      target: 30,
      rarity: "Epic"
    },
    {
      id: 10,
      title: "CIVI Millionaire",
      description: "Earn 5,000 CIVI tokens",
      icon: Crown,
      color: "from-purple-400 to-violet-500",
      progress: (userStats.civiEarned / 5000) * 100,
      current: userStats.civiEarned,
      target: 5000,
      rarity: "Legendary"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'Rare':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Epic':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Legendary':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Achievement Badges</h1>
              <p className="text-yellow-100 text-sm">Track progress & unlock achievements</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {earnedBadges.length}
                  </div>
                  <div className="text-yellow-100 text-xs">Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userStats.totalReports}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Reports</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userStats.eventsAttended}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Events</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {userStats.upvotesEarned}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Upvotes</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {userStats.civiEarned}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">CIVI</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {userStats.streakDays}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
              <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Earned Badges</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{earnedBadges.length} achievements unlocked</div>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold">
              {earnedBadges.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge, index) => (
              <Card 
                key={badge.id} 
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${badge.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <badge.icon className="h-7 w-7 text-white" />
                    </div>
                    <Badge className={`${getRarityColor(badge.rarity)} px-3 py-1 text-xs font-medium border-2`}>
                      {badge.rarity}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                    {badge.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {badge.description}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                    Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Badges */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Progress Towards Next Badges</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Keep going to unlock more achievements</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressBadges.map((badge, index) => (
              <Card 
                key={badge.id} 
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${badge.color} flex items-center justify-center shadow-lg`}>
                        <badge.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                          {badge.title}
                        </h3>
                        <Badge className={`${getRarityColor(badge.rarity)} px-3 py-1 text-xs font-medium border-2`}>
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {badge.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {badge.current} / {badge.target}
                      </span>
                    </div>
                    <Progress 
                      value={badge.progress} 
                      className="h-3 bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                      {Math.round(badge.progress)}% complete
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Information */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                How to Earn More Badges
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Badges are earned through active civic participation. Keep reporting issues, 
                attending events, and engaging with your community to unlock new achievements!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">Common</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Easy to earn</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">Rare</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Moderate effort</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <div className="font-bold text-purple-600 dark:text-purple-400">Epic</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Significant dedication</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">Legendary</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Ultimate achievement</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Badges;
