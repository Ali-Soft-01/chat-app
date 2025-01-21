import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TypingIndicator } from './TypingIndicator'
import { Send } from 'lucide-react'
import { useUser } from './UserContext'
import supabase from '@/utils/supabase/client'
import { insertMessage } from '@/lib/message'

/**
 * @param {Object} props - The properties object
 * @param {import('@supabase/realtime-js').RealtimeChannel} props.channel
 * @param {Function} props.onSendMessage
 * @param {(status: boolean) => Promise<void>} props.trackTyping
 */
export function MessageInput({ onSendMessage, trackTyping, typingUsers }) {
  const [message, setMessage] = useState('')

  const user = useUser()

  const textareaRef = useRef(null)

  const typingTimeoutRef = useRef(null) // Timeout reference for stopping typing
  const isTypingRef = useRef(false) // Tracks typing state to avoid duplicate requests

  // auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = async e => {
    e.preventDefault()

    const text = message.trim()
    if (!text || !user) return

    await insertMessage(text)
    setMessage('')
  }

  const handleInputChange = async e => {
    const { value } = e.target

    setMessage(value)

    // Start typing: Send request once
    if (!isTypingRef.current) {
      await trackTyping(true)
      isTypingRef.current = true
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      if (!isTypingRef.current) return false

      await trackTyping(false)
      isTypingRef.current = false // Reset typing state
    }, 2000)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <>
      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

      <form onSubmit={handleSubmit} className='flex space-x-2'>
        <Textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          value={message}
          onChange={handleInputChange}
          placeholder='Type your message...'
          className='flex-grow resize-none'
          rows={1}
        />
        <Button type='submit'>
          <Send className='h-4 w-4 mr-2' />
          Send
        </Button>
      </form>
    </>
  )
}
