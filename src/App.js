'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export default function DeportesQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''))
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('')

  const questions = [
    '¿Cuál es tu deporte favorito?',
    '¿Quién es tu atleta favorito?',
    '¿Cuál fue el último evento deportivo que viste?',
    '¿Practicas algún deporte regularmente? ¿Cuál?',
    '¿Cuál es tu equipo deportivo favorito?'
  ]

  useEffect(() => {
    const newSocket = io('https://db.estudiobeguier.com', {
      reconnectionDelayMax: 10000,
      withCredentials: true
    })

    newSocket.on('connect', () => {
      console.log('Conectado al servidor')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor')
      setIsConnected(false)
    })

    newSocket.on('writeSuccess', () => {
      showAlert('¡Respuesta guardada correctamente!', 'success')
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        showAlert('¡Todas las respuestas han sido guardadas!', 'success')
      }
    })

    newSocket.on('error', ({ message }: { message: string }) => {
      showAlert(message || 'Error al guardar la respuesta', 'error')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answers[currentQuestion].trim()) return

    socket?.emit('writeProject', {
      project: 'proyectoDeportes',
      folder: '/home/albertobeguier',
      data: {
        question: questions[currentQuestion],
        answer: answers[currentQuestion],
        timestamp: new Date().toISOString()
      }
    })
  }

  const showAlert = (message: string, type: string) => {
    setAlertMessage(message)
    setAlertType(type)
    setTimeout(() => {
      setAlertMessage('')
      setAlertType('')
    }, 5000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{questions[currentQuestion]}</h1>
        <div className={`text-sm mb-4 text-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers]
              newAnswers[currentQuestion] = e.target.value
              setAnswers(newAnswers)
            }}
            placeholder="Escribe tu respuesta aquí"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base"
            required
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="w-full p-3 bg-blue-600 text-white rounded-md text-base cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
          </button>
        </form>
        {alertMessage && (
          <div className={`mt-4 p-3 rounded-md ${alertType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {alertMessage}
          </div>
        )}
      </div>
    </div>
  )
}

