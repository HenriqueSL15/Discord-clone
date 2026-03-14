import { render, screen, fireEvent } from '@testing-library/react'
import FriendsList from '../FriendsList'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useUserStore } from '../../../store/useUserStore'
import * as authActions from '../../../actions/auth'

vi.mock('../../../store/useUserStore', () => ({
  useUserStore: vi.fn((selector: any) => selector({
    user: { id: 'user-1', username: 'me' },
    setPage: vi.fn()
  }))
}))

vi.mock('../../../actions/auth', () => ({
  changeFriendshipStatus: vi.fn()
}))

describe('FriendsList Component', () => {
  const mockFriendships = [
    {
      id: 'f1',
      status: 'ACCEPTED',
      senderId: 'user-1',
      receiverId: 'user-2',
      sender: {
        id: 'user-1',
        username: 'me',
        email: 'me@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      },
      receiver: {
        id: 'user-2',
        username: 'friend-a',
        email: 'friend-a@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      }
    },
    {
      id: 'f2',
      status: 'PENDING',
      senderId: 'user-3',
      receiverId: 'user-1',
      sender: {
        id: 'user-3',
        username: 'friend-b',
        email: 'friend-b@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      },
      receiver: {
        id: 'user-1',
        username: 'me',
        email: 'me@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      }
    }
  ] as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders friends and handles search filtering', () => {
    render(<FriendsList filteredFriendships={mockFriendships} />)
    
    expect(screen.getByText('friend-a')).toBeInTheDocument()
    expect(screen.getByText('friend-b')).toBeInTheDocument()

    const searchInput = screen.getByRole('textbox')
    fireEvent.change(searchInput, { target: { value: 'friend-a' } })

    expect(screen.getByText('friend-a')).toBeInTheDocument()
    expect(screen.queryByText('friend-b')).not.toBeInTheDocument()
  })

  it('handles accepting a friend request', () => {
    render(<FriendsList filteredFriendships={mockFriendships} />)
    
    // Check icons for PENDING request (friend-b)
    // The sender is user-3, receiver is me (user-1). 
    // So the Check/X buttons should be visible for friend-b.
    
    // Get all svg elements or find by container
    const checkBtn = screen.getByTestId('Check')?.parentElement || screen.getAllByRole('button')[1] 
    // Since lucide icons might not have easy test IDs, let's just find the one that triggers the action.
    
    // Re-rendering to be sure
    const { container } = render(<FriendsList filteredFriendships={[mockFriendships[1]]} />)
    const svgs = container.querySelectorAll('svg')
    
    // In our component: first is Check, second is X
    fireEvent.click(svgs[0])
    expect(authActions.changeFriendshipStatus).toHaveBeenCalledWith('ACCEPTED', 'f2')
  })

  it('handles rejecting a friend request', () => {
    render(<FriendsList filteredFriendships={[mockFriendships[1]]} />)
    fireEvent.click(screen.getByTestId('X'))
    expect(authActions.changeFriendshipStatus).toHaveBeenCalledWith('DELETE', 'f2')
  })

  it('handles clicking on an accepted friend to set page', () => {
    const setPageMock = vi.fn()
    vi.mocked(useUserStore).mockImplementation((selector: any) => selector({
      user: { id: 'user-1', username: 'me' },
      setPage: setPageMock
    }))

    render(<FriendsList filteredFriendships={[mockFriendships[0]]} />)
    fireEvent.click(screen.getByText('friend-a'))
    expect(setPageMock).toHaveBeenCalledWith('user-2')
  })

  it('handles cases where user is the receiver in search and display', () => {
    const receiverFriendship = {
      id: 'f3',
      status: 'ACCEPTED' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      senderId: 'user-2',
      receiverId: 'user-1',
      sender: {
        id: 'user-2',
        username: 'friend-a',
        email: 'friend-a@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      },
      receiver: {
        id: 'user-1',
        username: 'me',
        email: 'me@test.com',
        createdAt: new Date(),
        profilePicture: 'default.png',
        onlineStatus: 'ONLINE' as const,
        lastOnline: new Date()
      }
    }
    render(<FriendsList filteredFriendships={[receiverFriendship]} />)
    expect(screen.getByText('friend-a')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('friend-a'))
    // Since user is receiver (user-1), otherId should be senderId (user-2)
  })
})
