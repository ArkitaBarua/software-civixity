// Test data fixtures
export const mockPosts = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'Potholes',
    severity: 4,
    location: 'Main Street',
    created_at: '2024-01-15T10:30:00Z',
    upvotes: 12,
    downvotes: 2,
    image_url: null
  },
  {
    id: 2,
    title: 'Broken Street Light',
    description: 'Street light not working for 3 days',
    category: 'Street Lights',
    severity: 3,
    location: 'Oak Avenue',
    created_at: '2024-01-14T18:45:00Z',
    upvotes: 8,
    downvotes: 1,
    image_url: null
  },
  {
    id: 3,
    title: 'Garbage Collection Issue',
    description: 'Garbage not collected for 2 days',
    category: 'Waste Management',
    severity: 2,
    location: 'Pine Street',
    created_at: '2024-01-13T09:15:00Z',
    upvotes: 5,
    downvotes: 0,
    image_url: null
  }
]

export const mockChatHistory = [
  {
    id: 1,
    user_id: 'test-user-123',
    message: 'How do I report a pothole?',
    response: 'You can report a pothole by...',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    user_id: 'test-user-123',
    message: 'What is the process for street light repairs?',
    response: 'Street light repairs typically...',
    timestamp: '2024-01-15T11:00:00Z'
  }
]

export const mockPolls = [
  {
    id: 1,
    question: 'Should the city prioritize fixing potholes on main roads this month?',
    location: 'Kochi North',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    options: [
      { id: 1, text: 'Yes', votes: 45 },
      { id: 2, text: 'No', votes: 12 }
    ]
  },
  {
    id: 2,
    question: 'Do you support adding more street lights in poorly lit areas?',
    location: 'Fort Kochi',
    status: 'active',
    created_at: '2024-01-14T15:30:00Z',
    options: [
      { id: 3, text: 'Strongly Support', votes: 38 },
      { id: 4, text: 'Support', votes: 25 },
      { id: 5, text: 'Neutral', votes: 8 },
      { id: 6, text: 'Oppose', votes: 3 }
    ]
  }
]

export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  points: 150,
  badges: ['First Report', 'Community Helper']
}

// Test utilities
export const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const createMockImageFile = (name: string = 'test.jpg', size: number = 1024): File => {
  return createMockFile(name, 'image/jpeg', size)
}

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock Supabase client for tests
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockPosts, error: null }))
        }))
      })),
      ilike: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockPosts, error: null }))
        }))
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: mockPosts, error: null }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signIn: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  }
}
