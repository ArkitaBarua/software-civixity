const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { generateResponse } = require('../config/gemini');

// Get posts data from Supabase for context
const getPostsContext = async () => {
  try {
    const supabase = getSupabaseClient();
    
    // Get recent posts with relevant information
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        description,
        category,
        severity,
        location,
        created_at,
        upvotes,
        downvotes,
        image_url
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      return '';
    }

    if (!posts || posts.length === 0) {
      return 'No posts found in the database.';
    }

    // Format posts data for AI context
    const postsSummary = posts.map(post => ({
      id: post.id,
      title: post.title,
      category: post.category,
      severity: post.severity,
      location: post.location,
      engagement: (post.upvotes || 0) - (post.downvotes || 0),
      date: new Date(post.created_at).toLocaleDateString()
    }));

    // Create summary statistics
    const totalPosts = posts.length;
    const categories = [...new Set(posts.map(p => p.category))];
    const avgSeverity = posts.reduce((sum, p) => sum + (p.severity || 0), 0) / totalPosts;
    const highSeverityPosts = posts.filter(p => p.severity >= 4).length;

    return `
Recent Civic Issues Summary:
- Total posts: ${totalPosts}
- Categories: ${categories.join(', ')}
- Average severity: ${avgSeverity.toFixed(1)}/5
- High severity issues: ${highSeverityPosts}

Recent Posts:
${postsSummary.map(post => 
  `- ${post.title} (${post.category}, Severity: ${post.severity}/5, Location: ${post.location}, Engagement: ${post.engagement})`
).join('\n')}
    `.trim();

  } catch (error) {
    console.error('Error getting posts context:', error);
    return '';
  }
};

// Get location-specific posts
const getLocationPosts = async (location) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching location posts:', error);
      return [];
    }

    return posts || [];
  } catch (error) {
    console.error('Error getting location posts:', error);
    return [];
  }
};

// Get category-specific posts
const getCategoryPosts = async (category) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching category posts:', error);
      return [];
    }

    return posts || [];
  } catch (error) {
    console.error('Error getting category posts:', error);
    return [];
  }
};

// Helper to get recent chat history for a user (strict chronological order)
const getChatHistory = async (userId, limit = 10) => {
  if (!userId) return '';
  try {
    const supabase = getSupabaseClient();
    const { data: interactions, error } = await supabase
      .from('chat_interactions')
      .select('message, response')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error || !interactions || interactions.length === 0) return '';
    // Reverse to get chronological order (oldest to newest)
    const ordered = interactions.reverse();
    // Format as alternating User/Bot
    return ordered
      .map(i => `User: ${i.message}\nBot: ${i.response}`)
      .join('\n');
  } catch (e) {
    return '';
  }
};

// [TC_CVX_001] [TC_CVX_002] [TC_CVX_003] Main chatbot endpoint and validations
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      // [TC_CVX_002] Expect 400 on empty message
      return res.status(400).json({ error: 'Message is required' });
    }

    // Always require userId for contextuality
    // (If you want anonymous users to have context, use session or temp id)

    // Get recent chat history for context (last 10 messages)
    const chatHistory = userId ? await getChatHistory(userId, 10) : '';

    // Get context from Supabase posts
    const postsContext = await getPostsContext();

    // Combine contexts: conversation history first, then latest user message, then instructions, then posts context
    let fullContext = '';
    if (chatHistory) {
      fullContext = `Conversation history (oldest to newest):\n${chatHistory}\n\nLatest user message:\nUser: ${message}\n\nInstructions:\n- Use the conversation history above to answer the latest user message.\n- Do not repeat previous answers.\n- Be concise and direct.\n- Use markdown formatting for clarity.\n\n${postsContext}`;
    } else {
      fullContext = `${postsContext}\n\nLatest user message:\nUser: ${message}`;
    }

    // Generate AI response with context
    // [TC_CVX_001] Generate a response when env is correctly configured
    const aiResponse = await generateResponse(message, fullContext);

    // Log the interaction (optional)
    if (userId) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('chat_interactions')
          .insert({
            user_id: userId,
            message: message,
            response: aiResponse,
            timestamp: new Date().toISOString()
          });
      } catch (logError) {
        console.error('Error logging chat interaction:', logError);
        // Don't fail the request if logging fails
      }
    }

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      context: {
        totalPosts: postsContext ? 'Available' : 'None',
        hasRecentData: postsContext.length > 0
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    // [TC_CVX_003] Return safe 500 without leaking secrets if provider/env fails
    res.status(500).json({ 
      error: 'Failed to process chat request',
      message: error.message 
    });
  }
});

// [TC_CVX_007] Get posts by location
router.get('/posts/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const posts = await getLocationPosts(location);
    
    res.json({
      location,
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Error getting location posts:', error);
    res.status(500).json({ error: 'Failed to fetch location posts' });
  }
});

// [TC_CVX_008] Get posts by category
router.get('/posts/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const posts = await getCategoryPosts(category);
    
    res.json({
      category,
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Error getting category posts:', error);
    res.status(500).json({ error: 'Failed to fetch category posts' });
  }
});

// [TC_CVX_009] Get recent posts summary
router.get('/posts/summary', async (req, res) => {
  try {
    const postsContext = await getPostsContext();
    
    res.json({
      summary: postsContext,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting posts summary:', error);
    res.status(500).json({ error: 'Failed to fetch posts summary' });
  }
});

module.exports = router; 