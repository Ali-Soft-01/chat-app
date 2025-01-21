export function TypingIndicator({ typingUsers }) {
  return (
    <div className='flex items-center space-x-2 text-gray-500'>
      <div className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' />
      <div
        className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
        style={{ animationDelay: '0.4s' }}
      />
      <span className='text-sm'>
        {typingUsers.slice(0, 2).join(', ')}
        {typingUsers.length > 2 && `, and ${typingUsers.length - 2} others`}
        {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
      </span>
    </div>
  )
}
