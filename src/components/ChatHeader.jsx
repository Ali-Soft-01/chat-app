import { CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import supabase from '@/utils/supabase/client'
import { useUser } from './UserContext'

export function ChatHeader() {
  const user = useUser()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })

    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) console.log('error', error)
  }

  return (
    <CardHeader className='flex flex-row items-center justify-between'>
      <CardTitle>Global Chat</CardTitle>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleLogin}>Login</Button>
      )}
    </CardHeader>
  )
}
