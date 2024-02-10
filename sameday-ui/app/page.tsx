"use client";

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
// import Mic from './ui/Microphone';
// import AudioPlayer from './ui/AudioPlayer';
const Home = () => {

	const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [transcription, setTranscription] = useState('');
  const audioRef: any = useRef(null);

  useEffect(() => {
    if (audioUrl && isPlaying) {
      audioRef.current.play();
	    console.log(audioUrl, isPlaying, audioRef.current)
    }
  }, [audioUrl, isPlaying]);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);

      const audioChunks = [];

      mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
	console.log(recorder)
    if (recorder) {
      recorder.stop();
      setRecorder(null);
    }
  };

  const sendAudioToBackend = async (audioBlob: any) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/speak', {
        method: 'POST',
        body: formData,
      });
	  if (response.ok) {
		const audioBlob = await response.blob();
		const url = URL.createObjectURL(audioBlob);
		setAudioUrl(url);
		setIsPlaying(true);
	  }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
    }
  };
	
	  const handleAudioEnd = () => {
		setIsPlaying(false);
		setAudioUrl('');
	  };





	return (
		<>
			<section className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 h-screen flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2 max-w-sm text-center">
              <h1 className="text-3xl font-extrabold text-gray-800 mb-4">AI Sales Agent</h1>
              <div className="rounded-full bg-blue-500 text-white p-4 mx-auto mb-6 flex items-center justify-center" style={{ width: '150px', height: '150px' }}>
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15c2.761 0 5-2.239 5-5V6a5 5 0 10-10 0v4c0 2.761 2.239 5 5 5zm4 0c0 3.313-2.687 6-6 6s-6-2.687-6-6H6c0 3.859 3.141 7 7 7s7-3.141 7-7h-4z" />
                  </svg>
              </div>

              <p className="text-gray-700 mb-6">Press the button below to start a conversation with the AI sales agent.</p>
              {
                  recorder ? (
                      <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full w-32 focus:outline-none">Stop</button>
                  ) : (
                      <button onClick={startRecording} className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-full w-32 focus:outline-none">Start</button>
                  )
              }
              {/* <div className="text-left mt-4">
                  <p className="text-sm text-gray-600">AI Sales Agent Response:</p>
                  <div id="ai-response" className="bg-gray-100 p-3 rounded-md"></div>
              </div> */}
          </div>
          <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd}>
              Your browser does not support the audio element.
          </audio>
      </section>


		</>
	);
}


export default Home
