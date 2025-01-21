'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import supabase from '@/utils/supabase/client'
import { ChatHeader } from './ChatHeader'
import { useUser } from './UserContext'

export function Chat() {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [participantsData, setParticipantsData] = useState({})

  const channelRef = useRef(null)
  const participantsDataRef = useRef(participantsData)

  const user = useUser()

  const fetchMessages = async () => {
    const { data: messagesList, error } = await supabase
      .from('messages')
      .select('*, user(*)')
      .order('created_at', { ascending: true })

    // Storing user data in participantsData
    const userData = {}

    messagesList.forEach(message => {
      const {
        user: { id: userID },
      } = message

      // If the user is already in the participantsData or userData, skip
      if (participantsData[userID] || userData[userID]) return

      userData[userID] = message.user
    })

    setParticipantsData(prev => ({ ...prev, ...userData }))

    const messagesState = messagesList.map(msg => ({
      id: msg.id,
      user: {
        id: msg.user.id,
        name: msg.user.name,
        avatar_url: msg.user.avatar_url,
      },
      text: msg.text,
      timestamp: new Date(msg.created_at),
    }))

    if (error) {
      console.error('error', error)
      return setMessages([])
    }

    setMessages(messagesState)
  }

  useEffect(() => {
    participantsDataRef.current = participantsData
  }, [Object.keys(participantsData).length])

  const fetchUserProfile = async userID => {
    const updatedParticipantsData = participantsDataRef.current

    if (updatedParticipantsData[userID]) {
      return updatedParticipantsData[userID]
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userID)
      .single()

    return data
  }

  /** @param {typeof import('@supabase/supabase-js/')} payload */
  const handleRealtimeInsert = async payload => {
    const {
      new: { user: userID },
    } = payload

    const userProfile = await fetchUserProfile(userID)

    const newMessage = {
      id: payload.new.id,
      user: {
        id: userID,
        name: userProfile.name,
        avatar_url: userProfile.avatar_url,
      },
      text: payload.new.text,
      timestamp: new Date(payload.new.created_at),
    }

    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  /** @param {typeof import('@supabase/supabase-js/')} payload */
  const handleRealtimeUpdate = payload => {
    const newMessage = payload.new

    const updatedMessages = prevMessages =>
      prevMessages.map(msg => {
        return msg.id === newMessage.id
          ? { ...msg, text: newMessage.text }
          : msg
      })

    setMessages(updatedMessages)
  }

  const handleRealtimeDelete = payload => {
    const oldMessageID = payload.old.id

    const updatedMessages = prev => prev.filter(msg => msg.id !== oldMessageID)

    setMessages(updatedMessages)
  }

  const realTimeSubscription = () => {
    const channel = supabase.channel('messages', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        payload => {
          switch (payload.eventType) {
            case 'INSERT':
              handleRealtimeInsert(payload)
              break
            case 'UPDATE':
              handleRealtimeUpdate(payload)
              break
            case 'DELETE':
              handleRealtimeDelete(payload)
              break
            default:
              break
          }
        },
      )
      .on('presence', { event: 'sync' }, () => {
        // Recive presence data
        const state = channel.presenceState()

        let filteredUsers = []
        Object.keys(state).forEach(key => {
          if (key === user.id) return

          const presences = state[key]
          const typingUserName = presences.find(
            presence => presence.isTyping,
          )?.name

          if (typingUserName) filteredUsers.push(typingUserName)
        })

        setTypingUsers(filteredUsers)
      })
      .subscribe(async status => {
        if (status !== 'SUBSCRIBED') return

        // Sending first presence data to join
        await channel.track({
          online_at: new Date().toISOString(),
          active: true,
          isTyping: false,
          name: user.user_metadata.name,
        })
      })

    return channel
  }

  const trackTyping = async status => {
    await channelRef.current.track({
      isTyping: status,
      name: user.user_metadata.name,
    })
  }

  useEffect(() => {
    if (!user) return

    setParticipantsData(prev => ({
      ...prev,
      [user.id]: {
        id: user.id,
        name: user.user_metadata.name,
        avatar_url: user.user_metadata.avatar_url,
      },
    }))

    fetchMessages()

    const channel = realTimeSubscription()
    channelRef.current = channel

    return () => {
      channelRef.current.unsubscribe()
    }
  }, [user?.id])

  return (
    <Card className='w-full max-w-2xl mx-auto h-[calc(100vh-3rem)] flex flex-col'>
      <ChatHeader />
      <CardContent className='flex-grow flex flex-col space-y-4 overflow-hidden'>
        <MessageList messages={messages} />
        <MessageInput trackTyping={trackTyping} typingUsers={typingUsers} />
      </CardContent>
    </Card>
  )
}
