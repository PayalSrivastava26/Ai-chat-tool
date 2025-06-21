import { supabase } from '../supabaseClient'

// Save a chat message to Supabase
export const saveChatMessage = async (message, sender = 'user') => {
  try {
    console.log('💾 Saving message:', { message, sender })
    
    const { data, error } = await supabase
      .from('chats')
      .insert([{ message, sender }])
      .select()

    if (error) {
      console.error('❌ Error saving message:', error)
      throw error
    }

    console.log('✅ Message saved successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error saving message:', error)
    return null
  }
}

// Fetch chat history from Supabase
export const fetchChatHistory = async () => {
  try {
    console.log('📖 Fetching chat history...')
    
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching chat history:', error)
      throw error
    }

    console.log('✅ Chat history fetched:', data)
    return data || []
  } catch (error) {
    console.error('❌ Error fetching chat history:', error)
    return []
  }
}

// Clear all chat history
export const clearChatHistory = async () => {
  try {
    console.log('🗑️ Clearing chat history...')
    
    const { error } = await supabase
      .from('chats')
      .delete()
      .neq('id', 0) // Deletes all rows

    if (error) {
      console.error('❌ Error clearing chat history:', error)
      throw error
    }

    console.log('✅ Chat history cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Error clearing chat history:', error)
    return false
  }
}
