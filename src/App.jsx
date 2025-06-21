// import { useEffect, useState, useRef } from 'react'
// import './App.css'
// import { URL } from './utils/constants'
// import RecentSearch from './components/RecentSearch'
// import QuestionAnswer from './components/QuestionAnswer'
// import Header from './components/Header'
// import ChatInput from './components/ChatInput'
// import { saveChatMessage, fetchChatHistory } from './utils/supabaseChat'

// function App() {
//   const [question, setQuestion] = useState('')
//   const [result, setResult] = useState([])
//   // Remove localStorage usage - initialize as empty array
//   const [recentHistory, setRecentHistory] = useState([])
//   const [selectedHistory, setSelectedHistory] = useState('')
//   const [loader, setLoader] = useState(false)
//   // Initialize theme without localStorage, set default
//   const [darkMode, setDarkMode] = useState('dark')
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [chatHistory, setChatHistory] = useState([])
//   const scrollToAns = useRef()

//   // Load chat history from Supabase on component mount
//   useEffect(() => {
//     const loadChatHistory = async () => {
//       try {
//         const data = await fetchChatHistory()
//         if (data && data.length > 0) {
//           setChatHistory(data)
          
//           // Convert Supabase history to your result format
//           const formattedHistory = []
//           const recentQuestions = []
          
//           data.forEach(msg => {
//             if (msg.message_type === 'user') {
//               formattedHistory.push({ type: 'q', text: msg.message })
//               // Add to recent history for sidebar
//               recentQuestions.push(msg.message)
//             } else {
//               // Handle bot responses - split by lines or keep as single response
//               const responseText = msg.message.split('\n').filter(line => line.trim())
//               formattedHistory.push({ type: 'a', text: responseText.length > 0 ? responseText : [msg.message] })
//             }
//           })
          
//           setResult(formattedHistory)
//           // Set recent history from Supabase data
//           setRecentHistory(recentQuestions.slice(-20).reverse()) // Get last 20 questions, reverse for recent first
//         }
//       } catch (error) {
//         console.error('Error loading chat history:', error)
//       }
//     }
    
//     loadChatHistory()
//   }, [])

//   // Function to start a new chat (clear current conversation)
//   const startNewChat = () => {
//     setResult([])
//     setQuestion('')
//     setSelectedHistory('')
//     setLoader(false)
    
//     // Scroll to top
//     if (scrollToAns.current) {
//       scrollToAns.current.scrollTop = 0
//     }
    
//     // Close sidebar on mobile after starting new chat
//     if (window.innerWidth < 1024) {
//       setSidebarOpen(false)
//     }
//   }

//   // Function to get current date and time
//   const getCurrentDateTime = () => {
//     const now = new Date()
//     const options = { 
//       weekday: 'long', 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       timeZoneName: 'short'
//     }
//     return now.toLocaleDateString('en-US', options)
//   }

//   const askQuestion = async () => {
//     if (!question && !selectedHistory) {
//       return false
//     }

//     const userQuestion = question ? question : selectedHistory
    
//     // Update recent history in state (no localStorage)
//     if (question) {
//       setRecentHistory(prev => {
//         const updatedHistory = [question, ...prev.filter(item => item !== question)]
//         return updatedHistory.slice(0, 20) // Keep only 20 recent items
//       })
//     }
    
//     // Add current date context to the payload
//     const currentDateTime = getCurrentDateTime()
//     const contextualPrompt = `Current date and time: ${currentDateTime}\n\nUser question: ${userQuestion}`
    
//     const payload = {
//       contents: [{
//         parts: [{ text: contextualPrompt }]
//       }]
//     }

//     setLoader(true)
//     try {
//       // Save user message to Supabase immediately
//       await saveChatMessage(userQuestion, 'user')
      
//       let response = await fetch(URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       })

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       response = await response.json()
      
//       if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
//         throw new Error('Invalid response format from API')
//       }
      
//       let dataString = response.candidates[0].content.parts[0].text
      
//       // Improved response processing - don't rely on specific formatting
//       let processedResponse
//       if (dataString.includes('* ')) {
//         // If response has bullet points, split by asterisk
//         processedResponse = dataString.split('* ')
//         processedResponse = processedResponse.map((item) => item.trim()).filter(item => item.length > 0)
//       } else if (dataString.includes('\n')) {
//         // If response has line breaks, split by lines
//         processedResponse = dataString.split('\n').filter(line => line.trim().length > 0)
//       } else {
//         // Otherwise, keep as single response
//         processedResponse = [dataString.trim()]
//       }

//       // Save AI response to Supabase
//       await saveChatMessage(dataString, 'bot')

//       // Update UI state
//       setResult(prev => [...prev, 
//         { type: 'q', text: userQuestion }, 
//         { type: 'a', text: processedResponse }
//       ])
//       setQuestion('')

//       setTimeout(() => {
//         if (scrollToAns.current) {
//           scrollToAns.current.scrollTop = scrollToAns.current.scrollHeight
//         }
//       }, 500)
      
//     } catch (error) {
//       console.error('Error:', error)
      
//       // Show error message to user
//       setResult(prev => [...prev, 
//         { type: 'q', text: userQuestion }, 
//         { type: 'a', text: [`Sorry, I encountered an error: ${error.message}. Please try again.`] }
//       ])
      
//     } finally {
//       setLoader(false)
//     }
//   }

//   useEffect(() => {
//     if (selectedHistory) {
//       askQuestion()
//     }
//   }, [selectedHistory])

//   // Remove localStorage theme persistence for now
//   useEffect(() => {
//     if (darkMode === 'dark') {
//       document.documentElement.classList.add('dark')
//     } else {
//       document.documentElement.classList.remove('dark')
//     }
//   }, [darkMode])

//   return (
//     <div className={darkMode === 'dark' ? 'dark' : 'light'}>
//       <div className="flex h-screen bg-white dark:bg-gray-900">
        
//         {/* Sidebar */}
//         <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
//           fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-800 
//           transform transition-transform duration-300 ease-in-out 
//           lg:translate-x-0 lg:static lg:inset-0`}>
//           <RecentSearch 
//             recentHistory={recentHistory} 
//             setRecentHistory={setRecentHistory} 
//             setSelectedHistory={setSelectedHistory}
//             setSidebarOpen={setSidebarOpen}
//             startNewChat={startNewChat}
//           />
//         </div>

//         {/* Overlay for mobile */}
//         {sidebarOpen && (
//           <div 
//             className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//             onClick={() => setSidebarOpen(false)}
//           />
//         )}

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col">
//           <Header 
//             darkMode={darkMode} 
//             setDarkMode={setDarkMode}
//             setSidebarOpen={setSidebarOpen}
//             sidebarOpen={sidebarOpen}
//           />
          
//           <main className="flex-1 overflow-hidden">
//             <div className="h-full flex flex-col max-w-4xl mx-auto">
              
//               {/* Welcome Message */}
//               {result.length === 0 && (
//                 <div className="flex-1 flex items-center justify-center p-8">
//                   <div className="text-center">
//                     <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
//                       ChatTrix AI
//                     </h1>
//                     <p className="text-gray-600 dark:text-gray-400 text-lg">
//                       Your intelligent AI assistant. Ask me anything!
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Chat Messages */}
//               <div 
//                 ref={scrollToAns} 
//                 className="flex-1 overflow-y-auto p-4 space-y-4"
//               >
//                 {result.map((item, index) => (
//                   <QuestionAnswer key={index} item={item} index={index} />
//                 ))}
                
//                 {/* Loading indicator */}
//                 {loader && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 max-w-xs">
//                       <div className="flex space-x-2">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Chat Input */}
//               <ChatInput 
//                 question={question}
//                 setQuestion={setQuestion}
//                 askQuestion={askQuestion}
//                 loader={loader}
//               />
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default App
import { useEffect, useState, useRef } from 'react'
import './App.css'
import { URL } from './utils/constants'
import RecentSearch from './components/RecentSearch'
import QuestionAnswer from './components/QuestionAnswer'
import Header from './components/Header'
import ChatInput from './components/ChatInput'
import ChatHistory from './components/ChatHistory'
import ChatExport from './components/ChatExport'
import ChatShare from './components/ChatShare'
import FileUpload from './components/FileUpload'
import { ChatProvider } from './context/ChatContext'
import { saveChatMessage, fetchChatHistory } from './utils/supabaseChat'
import { saveChatToStorage, loadChatFromStorage, getAllChats, deleteSession } from './utils/chatStorage'
import { processFile } from './utils/fileProcessor'

function AppContent() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState([])
  const [recentHistory, setRecentHistory] = useState([])
  const [selectedHistory, setSelectedHistory] = useState('')
  const [loader, setLoader] = useState(false)
  const [darkMode, setDarkMode] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const scrollToAns = useRef()

  // Load chat history from Supabase on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const data = await fetchChatHistory()
        if (data && data.length > 0) {
          setChatHistory(data)
          
          // Convert Supabase history to your result format
          const formattedHistory = []
          const recentQuestions = []
          
          data.forEach(msg => {
            if (msg.message_type === 'user') {
              formattedHistory.push({ type: 'q', text: msg.message })
              recentQuestions.push(msg.message)
            } else {
              const responseText = msg.message.split('\n').filter(line => line.trim())
              formattedHistory.push({ type: 'a', text: responseText.length > 0 ? responseText : [msg.message] })
            }
          })
          
          setResult(formattedHistory)
          setRecentHistory(recentQuestions.slice(-20).reverse())
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
    
    loadChatHistory()
  }, [])

  // Function to start a new chat (clear current conversation)
  const startNewChat = () => {
    // Save current chat if it has content
    if (result.length > 0 && currentChatId) {
      saveChatToStorage(currentChatId, result, question || 'New Chat')
    }
    
    setResult([])
    setQuestion('')
    setSelectedHistory('')
    setLoader(false)
    setCurrentChatId(Date.now().toString()) // Generate new chat ID
    setUploadedFiles([])
    
    // Scroll to top
    if (scrollToAns.current) {
      scrollToAns.current.scrollTop = 0
    }
    
    // Close sidebar on mobile after starting new chat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  // Function to load a specific chat
  const loadChat = (chatId) => {
    const chatData = loadChatFromStorage(chatId)
    if (chatData) {
      setResult(chatData.messages)
      setCurrentChatId(chatId)
      setShowChatHistory(false)
      
      // Close sidebar on mobile
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
  }

  // Function to delete a chat
  const deleteChat = (chatId) => {
    deleteChatFromStorage(chatId)
    if (currentChatId === chatId) {
      startNewChat()
    }
  }

  // Function to get current date and time
  const getCurrentDateTime = () => {
    const now = new Date()
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }
    return now.toLocaleDateString('en-US', options)
  }

  // Handle file upload
  const handleFileUpload = async (files) => {
    const processedFiles = []
    
    for (const file of files) {
      try {
        const processedContent = await processFile(file)
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: processedContent
        })
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: `Error processing file: ${error.message}`,
          error: true
        })
      }
    }
    
    setUploadedFiles(prev => [...prev, ...processedFiles])
    setShowFileUpload(false)
  }

  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const askQuestion = async () => {
    if (!question && !selectedHistory) {
      return false
    }

    const userQuestion = question ? question : selectedHistory
    
    // Update recent history in state
    if (question) {
      setRecentHistory(prev => {
        const updatedHistory = [question, ...prev.filter(item => item !== question)]
        return updatedHistory.slice(0, 20)
      })
    }
    
    // Prepare context with files and current date
    const currentDateTime = getCurrentDateTime()
    let contextualPrompt = `Current date and time: ${currentDateTime}\n\n`
    
    // Add file context if files are uploaded
    if (uploadedFiles.length > 0) {
      contextualPrompt += `Uploaded files context:\n`
      uploadedFiles.forEach((file, index) => {
        contextualPrompt += `File ${index + 1}: ${file.name} (${file.type})\n`
        if (file.error) {
          contextualPrompt += `Error: ${file.content}\n`
        } else {
          contextualPrompt += `Content: ${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n`
        }
        contextualPrompt += `\n`
      })
    }
    
    contextualPrompt += `User question: ${userQuestion}`
    
    const payload = {
      contents: [{
        parts: [{ text: contextualPrompt }]
      }]
    }

    setLoader(true)
    try {
      // Save user message to Supabase immediately
      await saveChatMessage(userQuestion, 'user')
      
      let response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      response = await response.json()
      
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
        throw new Error('Invalid response format from API')
      }
      
      let dataString = response.candidates[0].content.parts[0].text
      
      // Improved response processing
      let processedResponse
      if (dataString.includes('* ')) {
        processedResponse = dataString.split('* ')
        processedResponse = processedResponse.map((item) => item.trim()).filter(item => item.length > 0)
      } else if (dataString.includes('\n')) {
        processedResponse = dataString.split('\n').filter(line => line.trim().length > 0)
      } else {
        processedResponse = [dataString.trim()]
      }

      // Save AI response to Supabase
      await saveChatMessage(dataString, 'bot')

      // Update UI state
      const newResult = [...result, 
        { type: 'q', text: userQuestion }, 
        { type: 'a', text: processedResponse }
      ]
      setResult(newResult)
      setQuestion('')

      // Save to local storage
      if (!currentChatId) {
        const newChatId = Date.now().toString()
        setCurrentChatId(newChatId)
        saveChatToStorage(newChatId, newResult, userQuestion)
      } else {
        saveChatToStorage(currentChatId, newResult, userQuestion)
      }

      setTimeout(() => {
        if (scrollToAns.current) {
          scrollToAns.current.scrollTop = scrollToAns.current.scrollHeight
        }
      }, 500)
      
    } catch (error) {
      console.error('Error:', error)
      
      // Show error message to user
      setResult(prev => [...prev, 
        { type: 'q', text: userQuestion }, 
        { type: 'a', text: [`Sorry, I encountered an error: ${error.message}. Please try again.`] }
      ])
      
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (selectedHistory) {
      askQuestion()
    }
  }, [selectedHistory])

  // Theme management
  useEffect(() => {
    if (darkMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={darkMode === 'dark' ? 'dark' : 'light'}>
      <div className="flex h-screen bg-white dark:bg-gray-900">
        
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-800 
          transform transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static lg:inset-0`}>
          <RecentSearch 
            recentHistory={recentHistory} 
            setRecentHistory={setRecentHistory} 
            setSelectedHistory={setSelectedHistory}
            setSidebarOpen={setSidebarOpen}
            startNewChat={startNewChat}
            setShowChatHistory={setShowChatHistory}
            setShowExportModal={setShowExportModal}
            setShowShareModal={setShowShareModal}
            setShowFileUpload={setShowFileUpload}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              
              {/* Welcome Message */}
              {result.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                      ChatTrix AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                      Your intelligent AI assistant. Ask me anything!
                    </p>
                  </div>
                </div>
              )}

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        file.error ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        <span>📎 {file.name}</span>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div 
                ref={scrollToAns} 
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {result.map((item, index) => (
                  <QuestionAnswer key={index} item={item} index={index} />
                ))}
                
                {/* Loading indicator */}
                {loader && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 max-w-xs">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <ChatInput 
                question={question}
                setQuestion={setQuestion}
                askQuestion={askQuestion}
                loader={loader}
                onFileUpload={() => setShowFileUpload(true)}
                hasFiles={uploadedFiles.length > 0}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {showChatHistory && (
        <ChatHistory
          isOpen={showChatHistory}
          onClose={() => setShowChatHistory(false)}
          onLoadChat={loadChat}
          onDeleteChat={deleteChat}
          currentChatId={currentChatId}
        />
      )}

      {showExportModal && (
        <ChatExport
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          chatData={result}
          chatTitle={currentChatId ? `Chat ${currentChatId}` : 'Current Chat'}
        />
      )}

      {showShareModal && (
        <ChatShare
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          chatData={result}
          chatTitle={currentChatId ? `Chat ${currentChatId}` : 'Current Chat'}
        />
      )}

      {showFileUpload && (
        <FileUpload
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  )
}

export default App