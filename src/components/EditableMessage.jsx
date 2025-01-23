import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit2, Check, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function EditableMessage({ message, ref }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedtext, setEditedtext] = useState(message.text)

  const handleEdit = async () => {
    setIsEditing(!isEditing)
  }

  const handleKeyDown = async e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEdit()
    }
  }

  const user = null

  return (
    <div className='flex items-start space-x-2 mb-4' ref={ref}>
      <Avatar>
        <AvatarImage src={message.user.avatar_url} />
        <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex-grow'>
        <div className='flex items-center'>
          <span className='font-semibold'>{message.user.name}</span>
          <span className='text-xs text-gray-500 ml-2'>
            {new Date(message.created_at).toLocaleString()}
          </span>
        </div>
        {isEditing ? (
          <Textarea
            value={editedtext}
            onChange={e => setEditedtext(e.target.value)}
            onKeyDown={handleKeyDown}
            className='mt-1'
            rows={3}
          />
        ) : (
          <p className='mt-1 whitespace-pre-wrap'>{message.text}</p>
        )}
      </div>
      {message.user.id === user.id && (
        <div className='flex flex-nowrap gap-2'>
          <Button variant='ghost' size='icon' onClick={handleEdit}>
            {isEditing ? (
              <Check className='h-4 w-4' />
            ) : (
              <Edit2 className='h-4 w-4' />
            )}
          </Button>
          <Button variant='ghost' size='icon' onClick={() => {}}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  )
}
