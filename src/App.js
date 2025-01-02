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
    const [lastRecord, setLastRecord] = useState(null);
    const [editIndex, setEditIndex] = useState(0);
    const [newAnswer, setNewAnswer] = useState('');
    const [deleteIndex, setDeleteIndex] = useState(0);
    const [jsonData, setJsonData] = useState(null);
    const [randomData, setRandomData] = useState(null);

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
            showAlert('¡Operación realizada correctamente!', 'success');
        });

        newSocket.on('error', ({ message }) => {
            showAlert(message || 'Error en la operación', 'error');
        });

        newSocket.on('readSuccess', (data) => {
            if (Array.isArray(data) && data.length > 0) {
                setLastRecord(data[data.length - 1]);
                setJsonData(data);
                showAlert('Último registro obtenido correctamente', 'success');
            } else {
                showAlert('No se encontraron registros', 'error');
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleGetRandomData = () => {
        socket.emit('readProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!answers[currentQuestion].trim()) return;

        socket.emit('writeProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes',
            data: JSON.stringify({
                question: questions[currentQuestion],
                answer: answers[currentQuestion],
                timestamp: new Date().toISOString()
            })
        });

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            showAlert('¡Todas las respuestas han sido enviadas!', 'success');
        }
    };

    const handlePut = () => {
        if (!randomData || !newAnswer) return;
        const updatedData = { ...randomData };
        updatedData.answer = newAnswer;
        socket.emit('updateProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes',
            data: JSON.stringify(updatedData)
        });
        setNewAnswer('');
    };

    const handleDelete = () => {
        if (!randomData) return;
        socket.emit('deleteProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes',
            data: JSON.stringify(randomData)
        });
        setRandomData(null);
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
                <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                </div>

                <h1>Responde a las preguntas:</h1>
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

                <div className="operations">
                    <h2>Operaciones adicionales</h2>

                    <div className="operation">
                        <h3>GET - Obtener respuesta aleatoria</h3>
                        <button onClick={handleGetRandomData} disabled={!isConnected}>
                            Conseguir una respuesta aleatoria
                        </button>
                        {randomData && (
                            <div className="data-display">
                                <h4>Pregunta:</h4>
                                <p>{randomData.question}</p>
                                <h4>Respuesta:</h4>
                                <p>{randomData.answer}</p>
                            </div>
                        )}
                    </div>

                    <div className="operation">
                        <h3>PUT - Actualizar respuesta</h3>
                        <input
                            type="text"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="Nueva respuesta"
                            disabled={!randomData}
                        />
                        <button onClick={handlePut} disabled={!newAnswer || !randomData}>
                            Actualizar
                        </button>
                    </div>

                    <div className="operation">
                        <h3>DELETE - Eliminar respuesta</h3>
                        <button onClick={handleDelete} disabled={!randomData}>
                            Eliminar
                        </button>
                    </div>

                    {alertMessage && (
                        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {alertMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
