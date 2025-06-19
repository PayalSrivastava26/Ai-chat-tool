// import Answer from './components/Answer';
// import { useState } from 'react'
// import './App.css'
// import { URL } from './constants';

// function App() {
//   const[question,setQuestion]=useState('');
//   const [result,setResult]= useState(undefined)

//   const payload={
//     "contents": [{
//         "parts": [
//             {"text": question}]
          
        
//       }
//     ]
  
//   }

//   const askQuestion= async()=>{
//     let response = await fetch(URL,{
//       method:"POST",
//       body:JSON.stringify(payload)
//     })
    
//     response = await response.json();

//     let dataString=(response.candidates[0].content.parts[0].text);
//     dataString =dataString.split("* ");
//     dataString=dataString.map((item)=>item.trim())

//     console.log(dataString);
//     setResult(dataString)
    
//   }
  

//   return (
//    <div className='grid grid-cols-5 h-screen text-white'> 
       
//        <div className='col-span-1 bg-zinc-800 h-screen p-4'>
//   <div className='text-white'>
//     New Chat
//   </div>
// </div>
//        <div className='col-span-4 p-10'>
// <div className='container h-full overflow-scroll'>

//   <div className='text-white'>
//     <ul>
//       {/* {result} */}
//      {
//       result&& result.map((item,index)=>(
//        <li className='text-left p-1'>
//          <Answer ans={item} key={index} />
//        </li> 
//       ))
//     }
//     </ul>
    
//   </div>

// </div>
//        <div className='bg-zinc-800 w-1/2 p-1 pr-5 text-white m-auto rounded-3xl 
//        border border-zinc-700 flex h-16'>
//         <input type="text" value= {question} onChange={(event)=>setQuestion(event.target.value)} className='w-full h-full p-3 bg-transparent text-white' 
//         placeholder='Ask me anything' />

//         <button onClick={askQuestion}>Ask</button>
//        </div>
//        </div>

//    </div>
//   )
// }

// export default App


import { useState } from 'react';
import './App.css';
import { URL } from './constants';
import Answer from './components/Answers';

function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(undefined);

  const payload = {
    contents: [
      {
        parts: [{ text: question }]
      }
    ]
  };

  const askQuestion = async () => {
    try {
      let response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      response = await response.json();

      let dataString = response.candidates[0].content.parts[0].text;
      dataString = dataString.split('* ');
      dataString = dataString.map((item) => item.trim());

      console.log(dataString);
      setResult(dataString);
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
    }
  };

  return (
    <div className='grid grid-cols-5 h-screen text-white'>
      <div className='col-span-1 bg-zinc-800 h-screen p-4'>
        <div className='text-white'>New Chat</div>
      </div>

      <div className='col-span-4 p-10'>
        <div className='container h-full overflow-scroll'>
          <div className='text-white'>
            <ul>
              {result &&
                result.map((item, index) => (
                  <li key={index} className='text-left p-1'>
                    <Answer ans={item} />
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className='bg-zinc-800 w-1/2 p-1 pr-5 text-white m-auto rounded-3xl border border-zinc-700 flex h-16 mt-4'>
          <input
            type='text'
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className='w-full h-full p-3 bg-transparent text-white'
            placeholder='Ask me anything'
          />

          <button onClick={askQuestion} className='px-4 text-sm'>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
