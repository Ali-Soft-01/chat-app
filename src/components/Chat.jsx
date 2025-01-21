'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ChatHeader } from './ChatHeader'

export function Chat() {
  return (
    <Card className='w-full max-w-2xl mx-auto h-[calc(100vh-3rem)] flex flex-col'>
      <ChatHeader />
      <CardContent className='flex-grow flex flex-col space-y-4 overflow-hidden'>
        <MessageList messages={[]} />
        <MessageInput trackTyping={() => {}} typingUsers={[]} />
      </CardContent>
    </Card>
  )
}
