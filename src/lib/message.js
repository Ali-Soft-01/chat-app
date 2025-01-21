import supabase from '@/utils/supabase/client'

// add jsdoc comment
/**
 * @param {string} text
 * @param {string} postID
 */
const updateMessage = async (text, postID) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ text: text.trim() })
    .eq('id', postID)

  if (error) {
    console.error('error', error)
  }
}

/** @param {string} messageID */
const deleteMessage = async messageID => {
  const { data, error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageID)

  if (error) {
    console.error('error', error)
  }
}

/** @param {string} text */
const insertMessage = async text => {
  const { data, error } = await supabase.from('messages').insert({ text })

  if (error) {
    console.error('error', error)
  }
}

export { updateMessage, deleteMessage, insertMessage }
