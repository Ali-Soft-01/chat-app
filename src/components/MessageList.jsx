import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EditableMessage } from './EditableMessage'

export function MessageList({ messages }) {
  const messagesEndRef = useRef(null)

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (!messagesEndRef.current) return
    messagesEndRef.current.scrollIntoView(true)
  }, [messages.length])

  return (
    <ScrollArea className='flex-grow pr-4'>
      <div className='space-y-4'>
        {messages.map((message, index) => (
          <EditableMessage
            key={message.id}
            message={message}
            ref={index + 1 === messages.length ? messagesEndRef : null} //Verify if the card is the last one.
          />
        ))}
      </div>
    </ScrollArea>
  )
}
