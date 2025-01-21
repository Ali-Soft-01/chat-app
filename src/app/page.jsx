import { Chat } from '@/components/Chat'

export default async function Home() {
  return (
    <main className='flex min-h-screen items-center justify-center p-4 overflow-hidden'>
      <Chat />
    </main>
  )
}
