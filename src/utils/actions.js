'use server'

import { createClientForServer } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const signinWithGithub = async () => {
  const supabase = await createClientForServer()

  // const auth_callback_url = `${process.env.SITE_URL}/auth/callback`
  const auth_callback_url = 'http://localhost:3000/auth/callback'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    // provider: 'google',
    options: {
      redirectTo: auth_callback_url,
    },
  })

  if (error) {
    console.log(error)
  }

  redirect(data.url)
}

const signOut = async () => {
  const supabase = await createClientForServer()
  await supabase.auth.signOut()
}

export { signOut, signinWithGithub }
