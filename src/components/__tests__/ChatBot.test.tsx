import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatBot from '@/components/ChatBot'
import { mockSupabaseClient } from '../../test/fixtures'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabaseClient
}))

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>
}))

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive'
}

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockMediaRecorder)
})

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  }
})

describe('ChatBot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chatbot button initially', () => {
    render(<ChatBot />)
    expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument()
  })

  it('opens chat window when button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    expect(screen.getByText(/hi! i'm your civic assistant/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument()
  })

  it('sends a message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Type message
    const input = screen.getByPlaceholderText(/type your message/i)
    await user.type(input, 'How do I report a pothole?')
    
    // Send message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Check if message appears
    await waitFor(() => {
      expect(screen.getByText('How do I report a pothole?')).toBeInTheDocument()
    })
  })

  it('shows typing indicator when sending message', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Type and send message
    const input = screen.getByPlaceholderText(/type your message/i)
    await user.type(input, 'Test message')
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Should show typing indicator
    await waitFor(() => {
      expect(screen.getByText(/typing/i)).toBeInTheDocument()
    })
  })

  it('closes chat window when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Close chat
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    // Chat should be closed
    expect(screen.queryByText(/hi! i'm your civic assistant/i)).not.toBeInTheDocument()
  })

  it('handles empty message submission', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Try to send empty message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Should not add empty message
    const messages = screen.getAllByRole('listitem')
    expect(messages).toHaveLength(1) // Only the initial bot message
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Type and send message
    const input = screen.getByPlaceholderText(/type your message/i)
    await user.type(input, 'Test message')
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Input should be cleared
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('handles Enter key to send message', async () => {
    const user = userEvent.setup()
    render(<ChatBot />)
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i })
    await user.click(chatButton)
    
    // Type message and press Enter
    const input = screen.getByPlaceholderText(/type your message/i)
    await user.type(input, 'Test message')
    await user.keyboard('{Enter}')
    
    // Message should be sent
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })
})
