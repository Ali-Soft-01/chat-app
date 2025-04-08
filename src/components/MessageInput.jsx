import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TypingIndicator } from './TypingIndicator'
import { Send } from 'lucide-react'
import { insertMessage } from '@/lib/message'

/**
 * @param {Object} props - The properties object
 * @param {(status: boolean) => Promise<void>} props.trackTyping
 * @param {string[]} props.typingUsers
 */
export function MessageInput({ typingUsers, trackTyping }) {
  const [message, setMessage] = useState('')

  const textareaRef = useRef(null)
  const isTypingRef = useRef(false)
  const typingTimeoutRef = useRef(null)

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
    if (!text) return

    await insertMessage(text)

    setMessage('')
  }

  const handleInputChange = async e => {
    const { value } = e.target

    setMessage(value)

    if (!isTypingRef.current) {
      await trackTyping(true)
      isTypingRef.current = true
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(async () => {
      if (!isTypingRef.current) return
      await trackTyping(false)

      isTypingRef.current = false
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
          className='grow resize-none'
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
