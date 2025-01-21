import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TypingIndicator } from './TypingIndicator'
import { Send } from 'lucide-react'

/**
 * @param {Object} props - The properties object
 * @param {(status: boolean) => Promise<void>} props.trackTyping
 * @param {string[]} props.typingUsers
 */
export function MessageInput({ typingUsers }) {
  const [message, setMessage] = useState('')

  const textareaRef = useRef(null)

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

    setMessage('')
  }

  const handleInputChange = async e => {
    const { value } = e.target

    setMessage(value)
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
