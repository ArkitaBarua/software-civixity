import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/pages/HomePage'
import { mockSupabaseClient, mockPosts } from '../../test/fixtures'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabaseClient
}))

// Mock useToast hook
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

// Mock usePoints context
const mockAddPoints = vi.fn()
const mockDeductPoints = vi.fn()
vi.mock('@/contexts/PointsContext', () => ({
  usePoints: () => ({
    addPoints: mockAddPoints,
    deductPoints: mockDeductPoints,
    points: 150
  })
}))

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
}
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation
})

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  it('renders homepage with essential elements', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/civixity/i)).toBeInTheDocument()
    expect(screen.getByText(/report an issue/i)).toBeInTheDocument()
    expect(screen.getByText(/recent stories/i)).toBeInTheDocument()
  })

  it('displays recent stories', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Water Leak Fixed')).toBeInTheDocument()
    expect(screen.getByText('New Bike Lane')).toBeInTheDocument()
    expect(screen.getByText('Park Renovation')).toBeInTheDocument()
    expect(screen.getByText('Traffic Light Fixed')).toBeInTheDocument()
  })

  it('opens report dialog when report button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    expect(screen.getByText(/report civic issue/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('validates required fields in report form', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Open report dialog
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit report/i })
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })

  it('submits report form with valid data', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Open report dialog
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Issue')
    await user.type(screen.getByLabelText(/description/i), 'Test description')
    await user.type(screen.getByLabelText(/location/i), 'Test Location')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit report/i })
    await user.click(submitButton)
    
    // Should show success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('success')
        })
      )
    })
  })

  it('handles image upload in report form', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Open report dialog
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    // Create mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/upload image/i)
    
    await user.upload(fileInput, file)
    
    // File should be uploaded
    expect(fileInput.files[0]).toBe(file)
  })

  it('handles voting on posts', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Find a vote button
    const upvoteButtons = screen.getAllByRole('button', { name: /upvote/i })
    if (upvoteButtons.length > 0) {
      await user.click(upvoteButtons[0])
      
      // Should update vote count
      await waitFor(() => {
        expect(screen.getByText(/1/i)).toBeInTheDocument()
      })
    }
  })

  it('displays user points', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/150/i)).toBeInTheDocument()
    expect(screen.getByText(/points/i)).toBeInTheDocument()
  })

  it('handles location auto-detection', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 9.9312,
          longitude: 76.2673
        }
      })
    })
    
    // Open report dialog
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    // Enable auto-detect location
    const autoDetectCheckbox = screen.getByLabelText(/auto-detect location/i)
    await user.click(autoDetectCheckbox)
    
    // Should populate location
    await waitFor(() => {
      const locationInput = screen.getByLabelText(/location/i)
      expect(locationInput).toHaveValue(expect.stringContaining('Kochi'))
    })
  })

  it('handles category selection', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Open report dialog
    const reportButton = screen.getByText(/report an issue/i)
    await user.click(reportButton)
    
    // Select category
    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    
    // Should show category options
    await waitFor(() => {
      expect(screen.getByText(/potholes/i)).toBeInTheDocument()
      expect(screen.getByText(/street lights/i)).toBeInTheDocument()
    })
  })
})
