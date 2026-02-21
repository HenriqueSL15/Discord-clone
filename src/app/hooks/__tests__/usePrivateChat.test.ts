import { renderHook, waitFor, act } from '@testing-library/react'
import { usePrivateChat } from '../usePrivateChat'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as authActions from '../../actions/auth'

// Mock pusher client
const mockChannel = {
  bind: vi.fn(),
  unbind: vi.fn(),
  name: 'f1'
}
vi.mock('../../lib/pusher-client', () => ({
  pusherClient: {
    subscribe: vi.fn(() => mockChannel),
    unsubscribe: vi.fn()
  }
}))
import { pusherClient } from '../../lib/pusher-client'

// Mock the store
vi.mock('../../store/useUserStore', () => ({
  useUserStore: (selector: any) => selector({
    user: { id: 'user-1', username: 'me', email: 'me@test.com' }
  })
}))

// Mock auth actions
vi.mock('../../actions/auth', () => ({
  getMessagesHistory: vi.fn(),
  getOtherUserInfo: vi.fn(),
  getUserFriendships: vi.fn(),
  sendMessage: vi.fn(),
  updateMessage: vi.fn(),
  deleteMessage: vi.fn(),
}))

// Mock api
vi.mock('../../api/api', () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      post: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
    }))
  }
}))
import api from '../../api/api'

describe('usePrivateChat', () => {
  const mockOtherUser = { id: 'user-2', username: 'other', email: 'other@test.com' }
  const mockMessages = [{ id: 'm1', message: 'Hi', senderId: 'user-2', receiverId: 'user-1', images: [] }]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authActions.getMessagesHistory).mockResolvedValue(mockMessages as any)
    vi.mocked(authActions.getOtherUserInfo).mockResolvedValue(mockOtherUser as any)
    vi.mocked(authActions.getUserFriendships).mockResolvedValue([
      { id: 'f1', senderId: 'user-1', receiverId: 'user-2' }
    ] as any)
  })

  it('should fetch history and user info on mount', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.otherUser).toEqual(mockOtherUser)
    expect(result.current.messages).toEqual(mockMessages)
    expect(pusherClient.subscribe).toHaveBeenCalledWith('f1')
  })

  it('should handle sending a text message', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(authActions.sendMessage).mockResolvedValue({ id: 'm2' } as any)

    await act(async () => {
      result.current.composer.setInputValue('Hello')
    })

    await act(async () => {
      await result.current.composer.handleSendMessage()
    })

    expect(authActions.sendMessage).toHaveBeenCalledWith(
      'user-2',
      'Hello',
      [],
      'f1'
    )
  })

  it('should handle deleting a message', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    
    vi.mocked(authActions.deleteMessage).mockResolvedValue({ id: 'm1' } as any)

    await act(async () => {
      await result.current.deleting.handleDeleteMessage('m1')
    })

    expect(result.current.messages).toHaveLength(0)
    expect(authActions.deleteMessage).toHaveBeenCalledWith('m1')
  })

  it('should handle editing a message', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(authActions.updateMessage).mockResolvedValue({ id: 'm1' } as any)

    await act(async () => {
      result.current.editor.setNewMessage('Updated Hello')
    })

    await act(async () => {
      await result.current.editor.handleEditMessage('m1', 'Hi', [])
    })

    expect(authActions.updateMessage).toHaveBeenCalledWith('m1', 'Updated Hello', [])
    expect(result.current.editor.id).toBe('')
  })

  it('should not call updateMessage if nothing changed', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.editor.setNewMessage('Hi')
      result.current.editor.setNewImages([])
    })

    await act(async () => {
      await result.current.editor.handleEditMessage('m1', 'Hi', [])
    })

    expect(authActions.updateMessage).not.toHaveBeenCalled()
  })

  it('should handle sending message with images', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    vi.mocked(api.post).mockResolvedValue({ data: { urls: ['url-1'] } })
    vi.mocked(authActions.sendMessage).mockResolvedValue({ id: 'm2' } as any)

    await act(async () => {
      result.current.composer.setImages([mockFile])
      result.current.composer.setInputValue('With Image')
    })

    await act(async () => {
      await result.current.composer.handleSendMessage()
    })

    expect(api.post).toHaveBeenCalledWith('/api/messageImages', expect.any(FormData), expect.any(Object))
    expect(authActions.sendMessage).toHaveBeenCalledWith(
      'user-2',
      'With Image',
      ['url-1'],
      'f1'
    )
  })

  it('should handle pusher new-message event', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const newMsg = { id: 'm2', message: 'Pusher msg', senderId: 'user-2', receiverId: 'user-1', images: [] }
    
    act(() => {
      const bindCall = vi.mocked(mockChannel.bind).mock.calls.find(call => call[0] === 'new-message')
      if (bindCall) {
        bindCall[1](newMsg)
      }
    })

    expect(result.current.messages).toContainEqual(newMsg)
  })

  it('should handle error when sending message', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(authActions.sendMessage).mockResolvedValue({ error: 'failed' } as any)

    await act(async () => {
      result.current.composer.setInputValue('Fail me')
    })
    await act(async () => {
      await result.current.composer.handleSendMessage()
    })

    expect(result.current.composer.inputValue).toBe('Fail me')
  })

  it('should handle image change', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const mockEvent = {
      target: {
        files: [mockFile],
        value: 'test'
      }
    } as any

    // URL.createObjectURL is not available in jsdom by default or needs mock
    global.URL.createObjectURL = vi.fn(() => 'blob-url')

    await act(async () => {
      result.current.composer.handleChangeImage(mockEvent)
    })

    expect(result.current.composer.images).toHaveLength(1)
    expect(result.current.composer.previewImage).toContain('blob-url')
  })

  it('should handle error in deleteMessage', async () => {
    const { result } = renderHook(() => usePrivateChat('user-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(authActions.deleteMessage).mockResolvedValue({ error: 'fail' } as any)

    await act(async () => {
      await result.current.deleting.handleDeleteMessage('m1')
    })
  
  })
})
