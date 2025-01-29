'use client'
import { useEffect, useRef, useState } from 'react'
import supabase from '@/utils/supabase/client'
import { useUser } from '@/components/UserContext'
import { MousePointer2 } from 'lucide-react'

const generateRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const Page = () => {
  const [cursors, setCursors] = useState({}) // Track other users' cursors

  const userRef = useRef(null)
  userRef.current = useUser()

  const channelRef = useRef(null)

  const userColorRef = useRef(generateRandomColor())

  const EVENT_NAME = 'cursor-move'

  const handleMouseMove = event => {
    const { clientX, clientY } = event

    const user = userRef.current

    channelRef.current.send({
      type: 'broadcast',
      event: EVENT_NAME,
      payload: {
        position: {
          x: clientX,
          y: clientY,
        },
        user: {
          name: user?.user_metadata.name,
          id: user?.id,
        },
        color: userColorRef.current,
      },
    })
  }

  useEffect(() => {
    const channel = supabase.channel('realtime:board')
    channelRef.current = channel

    channel
      .on('broadcast', { event: EVENT_NAME }, data => {
        const { user, position, color } = data.payload

        setCursors(prev => ({
          ...prev,
          [user.id]: {
            ...position,
            name: user.name,
            color,
          },
        }))
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Add event listener for mousemove
    window.addEventListener('mousemove', handleMouseMove)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className='max-w-screen max-h-screen overflow-hidden bg-red-900'>
      {Object.keys(cursors).map(id => (
        <div
          key={id}
          className='absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all'
          style={{
            top: cursors[id].y,
            left: cursors[id].x,
          }}
        >
          <MousePointer2
            color={cursors[id].color}
            fill={cursors[id].color}
            size={30}
          />

          <div
            className='mt-1 px-2 py-1 rounded text-xs font-bold text-white text-center'
            style={{
              backgroundColor: cursors[id].color,
            }}
          >
            {cursors[id].name}
          </div>
        </div>
      ))}
    </div>
  )
}
export default Page
