import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(Array(5).fill(''));
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const questions = [
        '¿Cuál es tu deporte favorito?',
        '¿Quién es tu atleta favorito?',
        '¿Cuál fue el último evento deportivo que viste?',
        '¿Practicas algún deporte regularmente? ¿Cuál?',
        '¿Cuál es tu equipo deportivo favorito?'
    ];

    useEffect(() => {
        const newSocket = io('https://db.estudiobeguier.com', {
            reconnectionDelayMax: 10000,
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Conectado al servidor');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Desconectado del servidor');
            setIsConnected(false);
        });

        newSocket.on('writeSuccess', () => {
            showAlert('¡Respuesta guardada correctamente!', 'success');
        });

        newSocket.on('error', ({ message }) => {
            showAlert(message || 'Error al guardar la respuesta', 'error');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (currentQuestion === questions.length) {
            // Reiniciar el cuestionario después de 3 segundos
            const timer = setTimeout(() => {
                setCurrentQuestion(0);
                setAnswers(Array(5).fill(''));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, questions.length]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!answers[currentQuestion].trim()) return;

        socket.emit('writeProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier',
            data: {
                question: questions[currentQuestion],
                answer: answers[currentQuestion],
                timestamp: new Date().toISOString()
            }
        });

        // Avanzar a la siguiente pregunta inmediatamente
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            showAlert('¡Todas las respuestas han sido enviadas!', 'success');
        }
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMessage('');
            setAlertType('');
        }, 5000);
    };

    return (
        <div className="App">
            <div className="card">
                {currentQuestion < questions.length ? (
                    <>
                        <h1>{questions[currentQuestion]}</h1>
                        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </div>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={answers[currentQuestion]}
                                onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[currentQuestion] = e.target.value;
                                    setAnswers(newAnswers);
                                }}
                                placeholder="Escribe tu respuesta aquí"
                                required
                            />
                            <button type="submit" disabled={!isConnected}>
                                {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
                            </button>
                        </form>
                    </>
                ) : (
                    <h1>¡Gracias por completar el cuestionario!</h1>
                )}
                {alertMessage && (
                    <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {alertMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

