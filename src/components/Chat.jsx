'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ChatHeader } from './ChatHeader'
import { useUser } from './UserContext'
import supabase from '@/utils/supabase/client'

export function Chat() {
  const [messages, setMessages] = useState([])
  const [participantsData, setParticipantsData] = useState({})

  const [typingUsers, setTypingUsers] = useState([])

  const channelRef = useRef(null)

  const participantsDataRef = useRef(participantsData)

  const user = useUser()

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

    setParticipantsData(prev => ({ ...prev, [userID]: data }))

    return data
  }

  const handleRealtimeInsert = async payload => {
    const { new: newMessage } = payload
    const { user: userID } = newMessage

    const userProfile = await fetchUserProfile(userID)

    const message = {
      ...newMessage,
      user: userProfile,
    }

    setMessages(prev => [...prev, message])
  }

  const handleRealtimeUpdate = payload => {
    const { new: newMessage } = payload

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
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          // filter: `user=eq.${user.id}`,
        },
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
        const newState = channel.presenceState()
        console.log('sync', newState)

        let filteredUsers = []

        Object.keys(newState).forEach(key => {
          if (key === user.id) return

          const presences = newState[key]
          const typingUserName = presences.find(
            presence => presence.isTyping,
          )?.name

          if (typingUserName) {
            filteredUsers.push(typingUserName)
          }
        })

        setTypingUsers(filteredUsers)
      })
      // .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      //   console.log('join', key, newPresences)
      // })
      // .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      //   console.log('leave', key, leftPresences)
      // })
      .subscribe(async status => {
        if (status !== 'SUBSCRIBED') return

        await channel.track({
          online_at: new Date().toISOString(),
          active: true,
          isTyping: false,
          name: user.user_metadata.name,
          id: user.id,
        })

        console.log('Realtime connection established.')
      })

    return channel
  }

  const fetchMessages = async () => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, user(*)')
      .order('created_at')

    if (error) {
      console.error('error', error)
      return
    }

    const userData = {}

    messages.forEach(msg => {
      const {
        user: { id: userID },
      } = msg

      userData[userID] = msg.user
    })

    setParticipantsData(prev => ({ ...prev, ...userData }))

    setMessages(messages)
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

    channelRef.current = realTimeSubscription()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [user?.id])

  const trackTyping = async status => {
    await channelRef.current.track({
      isTyping: status,
      name: user.user_metadata.name,
    })
  }

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
