import { Chat } from '@/components/Chat'
import { signinWithGithub } from '@/utils/actions'
import { createClientForServer } from '@/utils/supabase/server'

export default async function Home() {
  return (
    <main className='flex min-h-screen items-center justify-center p-4 overflow-hidden'>
      <Chat />
    </main>
  )
}
