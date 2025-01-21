'use client'
import { useContext, createContext, useEffect, useState } from 'react'
import supabase from '@/utils/supabase/client'

/**
 * @type {React.Context<import('@supabase/supabase-js').Session | null>}
 */
const SessionContext = createContext(null)

const UserContext = ({ children }) => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (session) {
        setSession(session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

const useUser = () => {
  const session = useContext(SessionContext)

  return session?.user
}

export { useUser }

export default UserContext
