function RecentSearch({ recentHistory, setRecentHistory, setSelectedHistory, setSidebarOpen, startNewChat }) {
  
  const clearHistory = () => {
    localStorage.clear()
    setRecentHistory([])
  }

  const clearSelectedHistory = (selectedItem) => {
    let history = JSON.parse(localStorage.getItem('history'))
    if (history) {
      history = history.filter((item) => item !== selectedItem)
      setRecentHistory(history)
      localStorage.setItem('history', JSON.stringify(history))
    }
  }

  const handleItemClick = (item) => {
    setSelectedHistory(item)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleNewChat = () => {
    startNewChat()
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      
      {/* Header with New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat History
          </h2>
          {recentHistory && recentHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Clear all history"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 
            bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
            text-white rounded-lg font-medium transition-all duration-200 
            shadow-sm hover:shadow-md transform hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {recentHistory && recentHistory.length > 0 ? (
          <div className="p-2 space-y-1">
            {recentHistory.map((item, index) => (
              <div
                key={index}
                className="group flex items-center space-x-2 p-3 rounded-lg 
                  hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div
                  onClick={() => handleItemClick(item)}
                  className="flex-1 min-w-0 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSelectedHistory(item)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 
                    rounded transition-all duration-200"
                  title="Delete this chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No chat history yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Start a conversation to see your history here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ChatTrix AI v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecentSearch