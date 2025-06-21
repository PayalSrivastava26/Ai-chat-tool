import Answer from './Answer'

function QuestionAnswer({ item, index }) {
  return (
    <div className="question-answer-container">
      {/* User Question */}
      {item.type === 'q' ? (
        <div className="flex justify-end mb-4">
          <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
            <p className="text-sm lg:text-base">{item.text}</p>
          </div>
        </div>
      ) : (
        /* AI Response */
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 max-w-xs lg:max-w-2xl">
            <div className="flex items-start space-x-3">
              {/* AI Avatar */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
              </div>
              
              {/* AI Message Content */}
              <div className="flex-1 min-w-0">
                {item.text.map((ansItem, ansIndex) => (
                  <div key={ansIndex} className="answer-item">
                    <Answer 
                      ans={ansItem}
                      totalResult={item.text.length}
                      index={ansIndex}
                      type={item.type}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionAnswer