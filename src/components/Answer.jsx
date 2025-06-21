import { useEffect, useState, useRef } from 'react'
import { checkHeading, replaceHeadingStarts } from '../utils/helper'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import ReactMarkdown from 'react-markdown'

function Answer({ ans, totalResult, index, type }) {
  const [heading, setHeading] = useState(false)
  const [answer, setAnswer] = useState(ans)
  const [copied, setCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState({})
  const answerRef = useRef(null)

  useEffect(() => {
    if (checkHeading(ans)) {
      setHeading(true)
      setAnswer(replaceHeadingStarts(ans))
    }
  }, [ans])

  // Copy function for the entire answer - exclude button text from DOM extraction
  const copyAnswer = async () => {
    try {
      let textToCopy = ''
      
      // Priority 1: Extract text from the rendered content div only (excluding button)
      if (answerRef.current) {
        // Find the content div (either heading or prose div)
        const contentDiv = answerRef.current.querySelector('.prose') || 
                          answerRef.current.querySelector('[class*="text-lg"]') ||
                          answerRef.current.querySelector('div:last-child')
        
        if (contentDiv) {
          textToCopy = contentDiv.innerText || contentDiv.textContent || ''
        } else {
          // Fallback: get all text but try to exclude button text
          const fullText = answerRef.current.innerText || answerRef.current.textContent || ''
          // Remove button text patterns
          textToCopy = fullText.replace(/^Copy All\s*/, '').replace(/Copy All.*?(?=\n|\r|$)/g, '').trim()
        }
      }
      
      // Priority 2: Use the original ans prop if DOM extraction fails
      if (!textToCopy.trim() && ans && ans.trim()) {
        textToCopy = ans
      }
      
      // Priority 3: Use the processed answer state as last resort
      if (!textToCopy.trim() && answer && answer.trim()) {
        textToCopy = answer
      }
      
      // Debug logging
      console.log('=== COPY DEBUG ===')
      console.log('DOM element exists:', !!answerRef.current)
      console.log('ans prop length:', ans ? ans.length : 0)
      console.log('answer state length:', answer ? answer.length : 0)
      console.log('textToCopy length:', textToCopy.length)
      console.log('First 200 chars:', textToCopy.substring(0, 200))
      console.log('Last 200 chars:', textToCopy.substring(Math.max(0, textToCopy.length - 200)))
      console.log('================')
      
      if (!textToCopy.trim()) {
        console.error('No text content found to copy')
        alert('No content available to copy')
        return
      }
      
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Primary copy failed:', err)
      
      // Fallback method
      try {
        let fallbackText = ans || answer || ''
        
        if (!fallbackText.trim()) {
          console.error('No fallback text available')
          alert('Failed to copy content')
          return
        }
        
        // Use the old document.execCommand method
        const textArea = document.createElement('textarea')
        textArea.value = fallbackText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } else {
          alert('Copy failed - please select and copy manually')
        }
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
        alert('Copy failed - please select and copy manually')
      }
    }
  }

  // Copy function for code blocks
  const copyCode = async (code, codeIndex) => {
    try {
      await navigator.clipboard.writeText(code)
      setCodeCopied(prev => ({ ...prev, [codeIndex]: true }))
      setTimeout(() => {
        setCodeCopied(prev => ({ ...prev, [codeIndex]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = code
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCodeCopied(prev => ({ ...prev, [codeIndex]: true }))
      setTimeout(() => {
        setCodeCopied(prev => ({ ...prev, [codeIndex]: false }))
      }, 2000)
    }
  }

  let codeBlockIndex = 0

  const renderer = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const currentCodeIndex = codeBlockIndex++
      
      return !inline && match ? (
        <div className="relative my-4">
          <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm">
            <span>{match[1]}</span>
            <button
              onClick={() => copyCode(String(children).replace(/\n$/, ''), currentCodeIndex)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              title={codeCopied[currentCodeIndex] ? "Copied!" : "Copy code"}
            >
              {codeCopied[currentCodeIndex] ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            {...props}
            children={String(children).replace(/\n$/, '')}
            language={match[1]}
            style={atomOneDark}
            PreTag="div"
            className="rounded-t-none"
          />
        </div>
      ) : (
        <code
          {...props}
          className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono"
        >
          {children}
        </code>
      )
    },
    
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6 first:mt-0">
        {children}
      </h1>
    ),
    
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-5 first:mt-0">
        {children}
      </h2>
    ),
    
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4 first:mt-0">
        {children}
      </h3>
    ),
    
    p: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed last:mb-0">
        {children}
      </p>
    ),
    
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1">
        {children}
      </ul>
    ),
    
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1">
        {children}
      </ol>
    ),
    
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">
        {children}
      </blockquote>
    ),
    
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline"
      >
        {children}
      </a>
    )
  }

  // For question type, don't show copy button
  if (type === 'q') {
    return <span className="text-white">{answer}</span>
  }

  // Single component with one copy button only
  // Only show copy button if this is the first or only answer component
  const shouldShowCopyButton = index === 0 || totalResult === 1

  return (
    <div className="relative" ref={answerRef}>
      {/* Copy button for the entire answer - only show for the main answer */}
      {shouldShowCopyButton && (
        <div className="flex justify-end mb-2">
          <button
            onClick={copyAnswer}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white
                       rounded-md px-3 py-1.5 text-xs border border-gray-600 hover:border-gray-500
                       flex items-center gap-1.5 transition-all duration-200 shadow-sm"
            title={copied ? 'Copied!' : 'Copy entire answer'}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Content rendering */}
      {heading ? (
        <div className="text-lg font-medium text-gray-900 dark:text-white">
          {answer}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown components={renderer}>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default Answer