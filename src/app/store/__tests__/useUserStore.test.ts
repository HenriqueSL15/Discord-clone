import { describe, expect, it, beforeEach } from 'vitest'
import { useUserStore } from '../useUserStore'

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: null,
      friendships: null,
      page: '',
      modal: null
    })
  })

  it('should set user correctly', () => {
    const mockUser = {
      id: 'user-1',
      username: 'test',
      email: 'test@test.com',
      createdAt: new Date(),
      lastOnline: new Date(),
      onlineStatus: 'ONLINE' as const,
      profilePicture: 'default.png'
    }
    useUserStore.getState().setUser(mockUser)
    expect(useUserStore.getState().user).toEqual(mockUser)
  })

  it('should set page correctly', () => {
    useUserStore.getState().setPage('friends')
    expect(useUserStore.getState().page).toBe('friends')
  })

  it('should set modal correctly', () => {
    useUserStore.getState().setModal('add-friend')
    expect(useUserStore.getState().modal).toBe('add-friend')
  })

  it('should update friendships with value', () => {
    const mockFriendships = [{ id: 'f-1' }] as any
    useUserStore.getState().setFriendships(mockFriendships)
    expect(useUserStore.getState().friendships).toEqual(mockFriendships)
  })

  it('should update friendships with function updater', () => {
    useUserStore.setState({ friendships: [{ id: 'f-1' }] as any })
    
    useUserStore.getState().setFriendships((prev: any) => [...prev, { id: 'f-2' }])
    
    expect(useUserStore.getState().friendships).toHaveLength(2)
    expect(useUserStore.getState().friendships?.[1].id).toBe('f-2')
  })
})
