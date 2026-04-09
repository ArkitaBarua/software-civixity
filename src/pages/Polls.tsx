import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, MapPin, Search, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const Polls = () => {
  const [search, setSearch] = useState('');
  const [polls, setPolls] = useState<any[]>([]);
  const [votes, setVotes] = useState<{ [pollId: string]: string }>({});
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [otherText, setOtherText] = useState<{ [pollId: string]: string }>({});
  const [otherError, setOtherError] = useState<{ [pollId: string]: string }>({});
  const [showOtherResponses, setShowOtherResponses] = useState<{ [pollId: string]: boolean }>({});
  const [otherResponses, setOtherResponses] = useState<{ [pollId: string]: any[] }>({});
  const [otherLikes, setOtherLikes] = useState<{ [voteId: string]: { like: number, dislike: number, userType?: string } }>({});

  const filteredPolls = polls.filter(
    (poll) =>
      poll.question.toLowerCase().includes(search.toLowerCase()) ||
      (poll.location || '').toLowerCase().includes(search.toLowerCase())
  );

  const activePolls = filteredPolls.filter((poll) => poll.status === 'active');
  const endedPolls = filteredPolls.filter((poll) => poll.status === 'ended');

  const seedSamplePolls = async () => {
    try {
      const samples = [
        {
          question: 'Should the city prioritize fixing potholes on main roads this month?',
          location: 'Kochi North',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          question: 'Do you support adding more street lights in poorly lit areas?',
          location: 'Fort Kochi',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          question: 'Should plastic waste segregation be made mandatory in all wards?',
          location: 'Edappally',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          question: 'Would you volunteer for monthly beach clean‑up drives?',
          location: 'Cherai Beach',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          question: 'Should the city plant 1000 new trees this monsoon?',
          location: 'Panampilly Nagar',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
      const { error } = await supabase.from('polls').insert(samples);
      if (error) throw error;
      const { data } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPolls(data);
      toast({ title: 'Sample polls added', description: 'New active polls are now available.' });
    } catch (e) {
      toast({ title: 'Failed to add polls', description: 'Please check permissions.' });
    }
  };

  // Auto-seed if there are no active polls (one-time per browser)
  useEffect(() => {
    const maybeSeed = async () => {
      try {
        const seeded = localStorage.getItem('civi_seeded_polls');
        const actives = polls.filter(p => p.status === 'active');
        if ((actives.length === 0) && seeded !== 'true') {
          await seedSamplePolls();
          localStorage.setItem('civi_seeded_polls', 'true');
        }
      } catch {}
    };
    if (polls) maybeSeed();
  }, [polls]);

  // Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPolls(data);
      }
    };
    fetchPolls();
  }, []);

  // Fetch user votes
  useEffect(() => {
    if (!user) return;
    const fetchVotes = async () => {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('poll_id, option')
        .eq('user_id', user.id);
      if (!error && data) {
        const voteMap: { [pollId: string]: string } = {};
        data.forEach((vote) => {
          voteMap[vote.poll_id] = vote.option;
        });
        setVotes(voteMap);
      }
    };
    fetchVotes();
  }, [user, polls]);

  // Handle voting
  const handleVote = async (pollId: string, option: string, otherTextValue?: string) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to vote.' });
      return;
    }
    // Prevent double voting
    if (votes[pollId]) return;
    if (option === 'Other' && (!otherTextValue || otherTextValue.trim() === '')) {
      setOtherError((prev) => ({ ...prev, [pollId]: 'Please enter your response.' }));
      return;
    }
    setOtherError((prev) => ({ ...prev, [pollId]: '' }));
    const insertObj: any = {
      poll_id: pollId,
      user_id: user.id,
      option,
    };
    if (option === 'Other') {
      insertObj.other_text = otherTextValue;
    }
    const { error } = await supabase.from('poll_votes').insert([insertObj]);
    if (!error) {
      setVotes((prev) => ({ ...prev, [pollId]: option }));
      toast({ title: 'Vote submitted', description: 'Thank you for voting!' });
    } else {
      toast({ title: 'Error', description: 'Failed to submit vote.' });
    }
  };

  // Add a new function to remove a user's vote for a poll
  const handleRemoveVote = async (pollId: string, refetch = false) => {
    if (!user) return;
    // Find the user's vote for this poll
    const { data, error } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();
    if (!error && data) {
      await supabase.from('poll_votes').delete().eq('id', data.id);
      setVotes((prev) => {
        const newVotes = { ...prev };
        delete newVotes[pollId];
        return newVotes;
      });
      setOtherText((prev) => ({ ...prev, [pollId]: '' }));
      toast({ title: 'Vote removed', description: 'You can vote again.' });
      if (refetch) {
        const fetchVotes = async () => {
          const { data, error } = await supabase
            .from('poll_votes')
            .select('poll_id, option')
            .eq('user_id', user.id);
          if (!error && data) {
            const voteMap: { [pollId: string]: string } = {};
            data.forEach((vote) => {
              voteMap[vote.poll_id] = vote.option;
            });
            setVotes(voteMap);
          }
        };
        fetchVotes();
      }
    }
  };

  // Add a new function to remove a user's 'Other' response for a poll
  const handleRemoveOtherResponse = async (pollId: string, refetch = false) => {
    if (!user) return;
    // Find the user's 'Other' vote for this poll
    const { data, error } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .eq('option', 'Other')
      .single();
    if (!error && data) {
      await supabase.from('poll_votes').delete().eq('id', data.id);
      setVotes((prev) => {
        const newVotes = { ...prev };
        delete newVotes[pollId];
        return newVotes;
      });
      setOtherText((prev) => ({ ...prev, [pollId]: '' }));
      toast({ title: 'Other response removed', description: 'You can enter a new response.' });
      if (refetch) {
        const fetchVotes = async () => {
          const { data, error } = await supabase
            .from('poll_votes')
            .select('poll_id, option')
            .eq('user_id', user.id);
          if (!error && data) {
            const voteMap: { [pollId: string]: string } = {};
            data.forEach((vote) => {
              voteMap[vote.poll_id] = vote.option;
            });
            setVotes(voteMap);
          }
        };
        fetchVotes();
      }
    }
  };

  // Fetch poll results for ended polls
  const [results, setResults] = useState<{ [pollId: string]: { [option: string]: number } }>({});
  const formatCount = (n: number) => {
    if (!Number.isFinite(n)) return '0';
    try {
      return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(n);
    } catch {
      // Fallback
      if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
      if (n >= 1_000) return `${Math.round(n / 100) / 10}K`;
      return String(n);
    }
  };
  useEffect(() => {
    const fetchResults = async () => {
      const endedPolls = polls.filter((poll) => poll.status === 'ended');
      for (const poll of endedPolls) {
        const { data, error } = await supabase
          .from('poll_votes')
          .select('option')
          .eq('poll_id', poll.id);
        if (!error && data) {
          // Always count Yes, No, Other
          const counts: { [option: string]: number } = { Yes: 0, No: 0, Other: 0 };
          data.forEach((vote) => {
            if (vote.option in counts) counts[vote.option] += 1;
          });
          setResults((prev) => ({ ...prev, [poll.id]: counts }));
        }
      }
    };
    if (polls.length > 0) fetchResults();
  }, [polls]);

  // Fetch 'Other' responses and their like/dislike counts for ended polls
  useEffect(() => {
    const fetchOtherResponses = async () => {
      for (const poll of endedPolls) {
        const { data: votes, error } = await supabase
          .from('poll_votes')
          .select('id, user_id, other_text, created_at')
          .eq('poll_id', poll.id)
          .eq('option', 'Other');
        if (!error && votes) {
          setOtherResponses(prev => ({ ...prev, [poll.id]: votes }));
          // Fetch likes/dislikes for these votes
          const voteIds = votes.map(v => v.id);
          if (voteIds.length > 0) {
            const { data: likesData, error: likesError } = await supabase
              .from('poll_other_likes')
              .select('poll_vote_id, type, user_id')
              .in('poll_vote_id', voteIds);
            if (!likesError && likesData) {
              const likeMap: { [voteId: string]: { like: number, dislike: number, userType?: string } } = {};
              voteIds.forEach(id => { likeMap[id] = { like: 0, dislike: 0 }; });
              likesData.forEach(like => {
                if (like.type === 'like') likeMap[like.poll_vote_id].like += 1;
                if (like.type === 'dislike') likeMap[like.poll_vote_id].dislike += 1;
                if (like.user_id === user?.id) likeMap[like.poll_vote_id].userType = like.type;
              });
              setOtherLikes(prev => ({ ...prev, ...likeMap }));
            }
          }
        }
      }
    };
    if (endedPolls.length > 0 && user) fetchOtherResponses();
  }, [endedPolls, user]);

  // Like/dislike handler
  const handleOtherLike = async (voteId: string, type: 'like' | 'dislike') => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to like/dislike.' });
      return;
    }
    // Upsert like/dislike
    const { error } = await supabase.from('poll_other_likes').upsert([
      {
        poll_vote_id: voteId,
        user_id: user.id,
        type,
      }
    ], { onConflict: 'poll_vote_id,user_id' });
    if (!error) {
      setOtherLikes(prev => ({
        ...prev,
        [voteId]: {
          ...prev[voteId],
          [type]: (prev[voteId]?.[type] || 0) + 1,
          userType: type
        }
      }));
    }
  };

  const fetchVotes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('poll_votes')
      .select('poll_id, option')
      .eq('user_id', user.id);
    if (!error && data) {
      const voteMap: { [pollId: string]: string } = {};
      data.forEach((vote) => {
        voteMap[vote.poll_id] = vote.option;
      });
      setVotes(voteMap);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">City Polls</h1>
              <p className="text-green-100 text-sm">Participate in civic polls and make your voice heard in Kochi!</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {polls.length}
                  </div>
                  <div className="text-green-100 text-xs">Total Polls</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Search Section */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search polls by question or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">{activePolls.length} Active</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="font-medium">{endedPolls.length} Ended</span>
              </div>
              {activePolls.length < 5 && (
                <Button onClick={seedSamplePolls} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Add Sample Polls
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Polls */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Polls</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400">Cast your vote on current civic issues</div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold">
            {activePolls.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePolls.length === 0 && (
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Polls</h3>
                <p className="text-slate-600 dark:text-slate-400">Check back later for new civic polls!</p>
              </CardContent>
            </Card>
          )}
          {activePolls.map((poll, index) => (
            <Card 
              key={poll.id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold">{poll.location}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Posted {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-slate-900 dark:text-white mb-4 text-lg">{poll.question}</div>
                <div className="flex flex-col gap-3 mb-6">
                  {["Yes", "No", "Other"].map((option) => (
                    <div key={option} className="flex flex-col gap-2">
                      <Button
                        variant={votes[poll.id] === option ? 'default' : 'outline'}
                        className={`justify-start h-12 text-base font-medium transition-all duration-300 ${
                          votes[poll.id] === option 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={async () => {
                          // If double-click just removed the vote, allow immediate re-vote
                          if (votes[poll.id] === option) return;
                          // Remove previous vote if any
                          if (votes[poll.id]) {
                            if (votes[poll.id] === 'Other') {
                              await handleRemoveOtherResponse(poll.id, false);
                            } else {
                              await handleRemoveVote(poll.id, false);
                            }
                          }
                          if (option === 'Other') {
                            setOtherText((prev) => ({ ...prev, [poll.id]: '' }));
                          } else {
                            handleVote(poll.id, option);
                          }
                          // Refetch votes in the background for consistency
                          fetchVotes();
                        }}
                        onDoubleClick={async () => {
                          if (votes[poll.id] === option) {
                            if (option === 'Other') {
                              await handleRemoveOtherResponse(poll.id, false);
                            } else {
                              await handleRemoveVote(poll.id, false);
                            }
                            // Update local state immediately, then refetch
                            setVotes((prev) => {
                              const newVotes = { ...prev };
                              delete newVotes[poll.id];
                              return newVotes;
                            });
                            fetchVotes();
                          }
                        }}
                      >
                        {option}
                        {votes[poll.id] === option && (
                          <CheckCircle className="h-5 w-5 ml-2 text-white" />
                        )}
                      </Button>
                      {/* Show input for Other if not voted, or if switching to Other */}
                      {option === 'Other' && (!votes[poll.id] || votes[poll.id] === 'Other') && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Please specify your response..."
                            value={otherText[poll.id] || ''}
                            onChange={e => setOtherText(prev => ({ ...prev, [poll.id]: e.target.value }))}
                            className="flex-1 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                            disabled={votes[poll.id] && votes[poll.id] !== 'Other'}
                          />
                          <Button
                            onClick={() => handleVote(poll.id, 'Other', otherText[poll.id])}
                            disabled={!otherText[poll.id] || otherText[poll.id].trim() === ''}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            Submit
                          </Button>
                        </div>
                      )}
                      {option === 'Other' && otherError[poll.id] && (
                        <div className="text-red-500 text-xs mt-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                          {otherError[poll.id]}
                        </div>
                      )}
                      {/* If user voted 'Other', show their response with double click to remove */}
                      {option === 'Other' && votes[poll.id] === 'Other' && (
                        <div className="mt-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                          <span
                            className="cursor-pointer underline"
                            title="Double click to remove your response"
                            onDoubleClick={() => handleRemoveOtherResponse(poll.id, false)}
                          >
                            (Double click to remove your response)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {votes[poll.id] && (
                  <div className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    Thank you for voting!
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ended Polls */}
      <div>
        <div className="flex items-center space-x-3 mb-6 mt-8">
          <div className="w-8 h-8 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ended Polls</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400">View results from completed civic polls</div>
          </div>
          <Badge className="bg-gradient-to-r from-slate-500 to-gray-500 text-white text-xs font-semibold">
            {endedPolls.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {endedPolls.length === 0 && (
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Ended Polls</h3>
                <p className="text-slate-600 dark:text-slate-400">Results will appear here once polls are completed!</p>
              </CardContent>
            </Card>
          )}
          {endedPolls.map((poll, index) => {
            const pollResults = results[poll.id] || {};
            const totalVotes = Object.values(pollResults).reduce((a, b) => a + b, 0);
            const userChoice = votes[poll.id];
            const userOtherText = (otherResponses[poll.id] || []).find((v: any) => v.user_id === user?.id)?.other_text;
            const hasOtherResponses = otherResponses[poll.id] && otherResponses[poll.id].length > 0;
            return (
              <Card 
                key={poll.id} 
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold">{poll.location}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Posted {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Poll Ended</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{poll.question}</div>
                  {userChoice && (
                    <div className="mb-3 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg inline-block">
                      Your vote: <span className="font-semibold">{userChoice}</span>
                      {userChoice === 'Other' && userOtherText ? (
                        <span className="ml-2 text-slate-700 dark:text-slate-300">— {userOtherText}</span>
                      ) : null}
                    </div>
                  )}
                  <div className="space-y-3 mb-4">
                    {["Yes", "No", "Other"].map((option) => (
                      <div key={option} className="flex items-center gap-3">
                        <Badge className="min-w-[60px] justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium" variant="outline">
                          {option}
                        </Badge>
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${((pollResults[option] || 0) / (totalVotes || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium min-w-[80px] text-right">
                          {formatCount(pollResults[option] || 0)} votes
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-lg text-center">
                    Total votes: {formatCount(totalVotes)}
                  </div>
                </CardContent>
                {showOtherResponses[poll.id] && hasOtherResponses && (
                  <div className="mt-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                    <div className="font-bold mb-3 text-slate-900 dark:text-white">Other Responses:</div>
                    <div className="space-y-3">
                      {otherResponses[poll.id].map((resp) => (
                        <div key={resp.id} className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-3 md:mb-0 flex-1">
                            <div className="text-slate-900 dark:text-white font-medium">{resp.other_text}</div>
                            <div className="text-xs text-slate-500 mt-1">By User {resp.user_id.slice(0, 6)}... at {formatDistanceToNow(new Date(resp.created_at), { addSuffix: true })}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant={otherLikes[resp.id]?.userType === 'like' ? 'default' : 'outline'} 
                              size="sm" 
                              onClick={() => handleOtherLike(resp.id, 'like')}
                              className={otherLikes[resp.id]?.userType === 'like' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : ''}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" /> {otherLikes[resp.id]?.like || 0}
                            </Button>
                            <Button 
                              variant={otherLikes[resp.id]?.userType === 'dislike' ? 'default' : 'outline'} 
                              size="sm" 
                              onClick={() => handleOtherLike(resp.id, 'dislike')}
                              className={otherLikes[resp.id]?.userType === 'dislike' ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : ''}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" /> {otherLikes[resp.id]?.dislike || 0}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hasOtherResponses && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                    onClick={() => setShowOtherResponses(prev => ({ ...prev, [poll.id]: !prev[poll.id] }))}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showOtherResponses[poll.id] ? 'Hide' : 'View'} Other Responses
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Polls; 