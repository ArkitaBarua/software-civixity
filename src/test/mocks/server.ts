import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock API responses
export const handlers = [
  // Chatbot API
  http.post('http://localhost:4000/api/chatbot/chat', async ({ request }) => {
    const body = await request.json() as { message: string; userId?: string }
    
    if (!body.message) {
      return HttpResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      response: `Mock response to: "${body.message}"`,
      timestamp: new Date().toISOString(),
      context: {
        totalPosts: 'Available',
        hasRecentData: true
      }
    })
  }),

  // Image detection API
  http.post('http://localhost:4000/api/detect-image', async ({ request }) => {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return HttpResponse.json(
        { error: 'No image uploaded' },
        { status: 400 }
      )
    }
    
    if (!['image/jpeg', 'image/png'].includes(image.type)) {
      return HttpResponse.json(
        { error: 'Unsupported media type' },
        { status: 415 }
      )
    }
    
    if (image.size > 8 * 1024 * 1024) {
      return HttpResponse.json(
        { error: 'File too large' },
        { status: 413 }
      )
    }
    
    return HttpResponse.json({
      result: Math.random() > 0.5 ? 'AI' : 'Natural'
    })
  }),

  // Posts API
  http.get('http://localhost:4000/api/chatbot/posts/location/:location', ({ params }) => {
    const { location } = params
    const mockPosts = [
      {
        id: 1,
        title: `Mock post in ${location}`,
        description: 'Test description',
        category: 'Potholes',
        severity: 3,
        location: location as string,
        created_at: new Date().toISOString(),
        upvotes: 5,
        downvotes: 1
      }
    ]
    
    return HttpResponse.json({
      location,
      posts: mockPosts,
      count: mockPosts.length
    })
  }),

  http.get('http://localhost:4000/api/chatbot/posts/category/:category', ({ params }) => {
    const { category } = params
    const mockPosts = [
      {
        id: 1,
        title: `Mock ${category} post`,
        description: 'Test description',
        category: category as string,
        severity: 2,
        location: 'Test Location',
        created_at: new Date().toISOString(),
        upvotes: 3,
        downvotes: 0
      }
    ]
    
    return HttpResponse.json({
      category,
      posts: mockPosts,
      count: mockPosts.length
    })
  }),

  http.get('http://localhost:4000/api/chatbot/posts/summary', () => {
    return HttpResponse.json({
      summary: 'Mock posts summary with recent civic issues',
      timestamp: new Date().toISOString()
    })
  }),

  // Health check
  http.get('http://localhost:4000/api/health', () => {
    return HttpResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'connected',
        gemini: 'connected'
      }
    })
  })
]

export const server = setupServer(...handlers)
