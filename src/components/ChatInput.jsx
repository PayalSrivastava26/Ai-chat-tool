function ChatInput({ question, setQuestion, askQuestion, loader }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!loader && question.trim()) {
        askQuestion()
      }
    }
  }

  const handleInput = (e) => {
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto'
    
    // Calculate new height based on content, with min and max limits
    const newHeight = Math.min(Math.max(e.target.scrollHeight, 48), 200)
    e.target.style.height = newHeight + 'px'
    
    // Show scrollbar when content exceeds max height
    if (e.target.scrollHeight > 200) {
      e.target.style.overflowY = 'auto'
    } else {
      e.target.style.overflowY = 'hidden'
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end space-x-3">
          
          {/* Input container */}
          <div className="flex-1 relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Message ChatTrix AI..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600
                 bg-white dark:bg-gray-800 px-4 py-3 pr-12
                 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[48px] max-h-[200px] leading-6
                scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              disabled={loader}
              style={{
                height: '48px',
                minHeight: '48px',
                maxHeight: '200px',
                overflowY: 'hidden'
              }}
            />
            
            {/* Send button */}
            <button
              onClick={askQuestion}
              disabled={loader || !question.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-xl
                bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600
                text-white transition-colors duration-200
                disabled:cursor-not-allowed"
            >
              {loader ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Helper text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatInput