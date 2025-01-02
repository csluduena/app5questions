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
    const [getData, setGetData] = useState(null);
    const [putData, setPutData] = useState({ id: '', newAnswer: '' });
    const [deleteId, setDeleteId] = useState('');

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
            setGetData(data);
            showAlert('Datos obtenidos correctamente', 'success');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (currentQuestion === questions.length) {
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

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            showAlert('¡Todas las respuestas han sido enviadas!', 'success');
        }
    };

    const handleGet = () => {
        socket.emit('readProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier'
        });
    };

    const handlePut = () => {
        if (!putData.id || !putData.newAnswer) return;
        socket.emit('updateProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier',
            id: putData.id,
            newData: { answer: putData.newAnswer }
        });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        socket.emit('deleteProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier',
            id: deleteId
        });
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
                
                {currentQuestion < questions.length ? (
                    <>
                        <h1>{questions[currentQuestion]}</h1>
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

                <div className="operations">
                    <h2>Operaciones adicionales</h2>
                    
                    <div className="operation">
                        <h3>GET - Obtener datos</h3>
                        <button onClick={handleGet} disabled={!isConnected}>Obtener datos</button>
                        {getData && (
                            <div className="data-display">
                                <h4>Datos obtenidos:</h4>
                                <pre>{JSON.stringify(getData, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    <div className="operation">
                        <h3>PUT - Actualizar respuesta</h3>
                        <input
                            type="text"
                            value={putData.id}
                            onChange={(e) => setPutData({...putData, id: e.target.value})}
                            placeholder="ID de la respuesta"
                        />
                        <input
                            type="text"
                            value={putData.newAnswer}
                            onChange={(e) => setPutData({...putData, newAnswer: e.target.value})}
                            placeholder="Nueva respuesta"
                        />
                        <button onClick={handlePut} disabled={!isConnected}>Actualizar</button>
                    </div>

                    <div className="operation">
                        <h3>DELETE - Eliminar respuesta</h3>
                        <input
                            type="text"
                            value={deleteId}
                            onChange={(e) => setDeleteId(e.target.value)}
                            placeholder="ID de la respuesta a eliminar"
                        />
                        <button onClick={handleDelete} disabled={!isConnected}>Eliminar</button>
                    </div>
                </div>

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

