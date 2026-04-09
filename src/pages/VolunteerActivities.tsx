
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  BookOpen,
  PawPrint,
  GraduationCap
} from "lucide-react";

const VolunteerActivities = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date('2024-07-20'));
  const [currentMonth, setCurrentMonth] = useState(new Date('2024-07-01'));
  const [showAllEvents, setShowAllEvents] = useState(false);

  const events = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      description: "Join us for a community beach cleanup to protect marine life and keep our shores beautiful. We'll collect plastic waste, clean up debris, and educate visitors about marine conservation.",
      date: "2024-07-20",
      time: "9:00 AM - 12:00 PM",
      location: "Marina Beach, South End",
      participants: 45,
      maxParticipants: 60,
      points: 50,
      status: "upcoming",
      category: "Environment"
    },
    {
      id: 2,
      title: "Orphanage Donation Drive",
      description: "Help collect and organize donations for local orphanages. We'll gather books, toys, clothes, and educational materials to support children in need.",
      date: "2024-07-22",
      time: "10:00 AM - 3:00 PM",
      location: "Community Center, Downtown",
      participants: 28,
      maxParticipants: 35,
      points: 75,
      status: "upcoming",
      category: "Community"
    },
    {
      id: 3,
      title: "Tree Planting Initiative",
      description: "Help us plant native trees in the city park to improve air quality and create green spaces. Learn about local flora and contribute to urban reforestation.",
      date: "2024-07-25",
      time: "8:00 AM - 11:00 AM", 
      location: "Central City Park",
      participants: 32,
      maxParticipants: 40,
      points: 75,
      status: "upcoming",
      category: "Environment"
    },
    {
      id: 4,
      title: "Senior Citizens Support",
      description: "Volunteer to assist senior citizens with grocery shopping, basic errands, and provide companionship. Help make their day brighter with your presence.",
      date: "2024-07-27",
      time: "2:00 PM - 5:00 PM",
      location: "Various Locations",
      participants: 18,
      maxParticipants: 20,
      points: 60,
      status: "upcoming",
      category: "Community"
    },
    {
      id: 5,
      title: "Blood Donation Camp",
      description: "Participate in our blood donation drive to help save lives. Medical professionals will be present to ensure a safe and comfortable donation experience.",
      date: "2024-07-29",
      time: "9:00 AM - 4:00 PM",
      location: "City Hospital, Main Wing",
      participants: 55,
      maxParticipants: 80,
      points: 100,
      status: "upcoming",
      category: "Health"
    },
    {
      id: 6,
      title: "Street Art & Graffiti Cleanup",
      description: "Help clean up unwanted graffiti and create beautiful street art in designated areas. Transform urban spaces with positive community art.",
      date: "2024-07-31",
      time: "10:00 AM - 2:00 PM",
      location: "Downtown Art District",
      participants: 22,
      maxParticipants: 30,
      points: 65,
      status: "upcoming",
      category: "Community"
    },
    {
      id: 7,
      title: "Food Bank Volunteering",
      description: "Sort, package, and distribute food items to families in need. Help ensure no one goes hungry in our community.",
      date: "2024-08-02",
      time: "11:00 AM - 3:00 PM",
      location: "Community Food Bank",
      participants: 35,
      maxParticipants: 45,
      points: 55,
      status: "upcoming",
      category: "Community"
    },
    {
      id: 8,
      title: "Animal Shelter Support",
      description: "Help care for abandoned animals at the local shelter. Activities include feeding, cleaning, walking dogs, and socializing with cats.",
      date: "2024-08-05",
      time: "9:00 AM - 1:00 PM",
      location: "City Animal Shelter",
      participants: 15,
      maxParticipants: 20,
      points: 70,
      status: "upcoming",
      category: "Animals"
    },
    {
      id: 9,
      title: "Digital Literacy Workshop",
      description: "Teach basic computer skills to senior citizens and help them stay connected with their families through technology.",
      date: "2024-08-07",
      time: "2:00 PM - 5:00 PM",
      location: "Senior Community Center",
      participants: 12,
      maxParticipants: 15,
      points: 80,
      status: "upcoming",
      category: "Education"
    },
    {
      id: 10,
      title: "Community Garden Maintenance",
      description: "Help maintain the community garden by weeding, watering, and harvesting vegetables. Learn sustainable gardening practices.",
      date: "2024-08-10",
      time: "8:00 AM - 11:00 AM",
      location: "Riverside Community Garden",
      participants: 20,
      maxParticipants: 25,
      points: 45,
      status: "upcoming",
      category: "Environment"
    },
    {
      id: 11,
      title: "Library Book Drive",
      description: "Collect and organize books for underprivileged schools. Help promote literacy and education in our community.",
      date: "2024-08-12",
      time: "10:00 AM - 4:00 PM",
      location: "Central Library",
      participants: 25,
      maxParticipants: 30,
      points: 60,
      status: "upcoming",
      category: "Education"
    },
    {
      id: 12,
      title: "Elderly Home Visit",
      description: "Visit elderly residents in nursing homes, provide companionship, read to them, and help with recreational activities.",
      date: "2024-08-15",
      time: "3:00 PM - 6:00 PM",
      location: "Sunset Nursing Home",
      participants: 18,
      maxParticipants: 25,
      points: 65,
      status: "upcoming",
      category: "Community"
    }
  ];

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Environment':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Community':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Health':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Animals':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Education':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Environment':
        return Leaf;
      case 'Community':
        return Heart;
      case 'Health':
        return Heart;
      case 'Animals':
        return PawPrint;
      case 'Education':
        return GraduationCap;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Section */}
        <Card className="lg:w-1/3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              Activity Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
              modifiers={{
                hasEvent: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvent: { 
                  backgroundColor: 'rgb(20 184 166)', 
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '8px'
                }
              }}
            />
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"></div>
                <span className="font-medium">Days with events</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                Click on highlighted dates to view events
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="lg:w-2/3 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {showAllEvents ? (
                  'All Upcoming Events'
                ) : selectedDate ? (
                  `Events for ${selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}`
                ) : (
                  'All Events'
                )}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {showAllEvents ? 'Browse all available volunteer opportunities' : 'Events scheduled for the selected date'}
              </p>
            </div>
            <Button
              variant={showAllEvents ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowAllEvents(!showAllEvents);
                if (showAllEvents) {
                  setSelectedDate(new Date('2024-07-20'));
                } else {
                  setSelectedDate(undefined);
                }
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {showAllEvents ? 'View by Date' : 'View All Events'}
            </Button>
          </div>

          {!showAllEvents && selectedDate && getEventsForDate(selectedDate).length === 0 ? (
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  No events scheduled
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  There are no volunteer activities scheduled for this date. Check other dates or browse all available opportunities.
                </p>
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowAllEvents(true)}
                >
                  View All Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {(showAllEvents ? events : (selectedDate ? getEventsForDate(selectedDate) : events)).map((event, index) => (
                <Card 
                  key={event.id} 
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              {(() => {
                                const IconComponent = getCategoryIcon(event.category);
                                return <IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
                              })()}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {event.title}
                            </h3>
                          </div>
                          <Badge className={`${getStatusColor(event.status)} px-3 py-1 text-sm font-medium border-2`}>
                            {event.status === 'completed' ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </>
                            ) : (
                              'Upcoming'
                            )}
                          </Badge>
                          <Badge className={`${getCategoryColor(event.category)} px-3 py-1 text-sm font-medium border-2`}>
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 text-base leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-3 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{new Date(event.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Date</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{event.time}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{event.location}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Location</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {event.participants}/{event.maxParticipants}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">participants</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">C</span>
                          </div>
                          <div>
                            <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                              +{event.points} CIVI
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                          </div>
                        </div>
                      </div>
                      
                      {event.status === 'upcoming' ? (
                        <Button 
                          className={`font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                            event.participants >= event.maxParticipants 
                              ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                          }`}
                          disabled={event.participants >= event.maxParticipants}
                        >
                          {event.participants >= event.maxParticipants ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Full
                            </div>
                          ) : (
                            'Register Now'
                          )}
                        </Button>
                      ) : (
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-4 py-2 text-sm font-medium border-2 border-green-200 dark:border-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          +{event.points} CIVI Earned
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerActivities;
