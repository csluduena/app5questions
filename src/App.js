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
    const [jsonData, setJsonData] = useState(null); // Estado para los datos obtenidos

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
                setJsonData(data); // Guardar los datos obtenidos
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
            folder: '/home/albertobeguier/proyectoDeportes', // Ruta actualizada
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
            folder: '/home/albertobeguier/proyectoDeportes' // Ruta actualizada
        });
    };

    const handlePut = () => {
        if (!lastRecord || !newAnswer) return;
        const updatedRecord = { ...lastRecord };
        updatedRecord.data[editIndex].answer = newAnswer;
        socket.emit('updateProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes',
            data: updatedRecord
        });
        setNewAnswer('');
    };

    const handleDelete = () => {
        if (!lastRecord) return;
        const updatedRecord = { ...lastRecord };
        updatedRecord.data.splice(deleteIndex, 1);
        socket.emit('updateProject', {
            project: 'proyectoDeportes',
            folder: '/home/albertobeguier/proyectoDeportes',
            data: updatedRecord
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
                        <h3>GET - Obtener último registro</h3>
                        <button onClick={handleGet} disabled={!isConnected}>Obtener datos</button>
                        {jsonData && (
                            <div className="data-display">
                                <h4>Datos obtenidos:</h4>
                                <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    <div className="operation">
                        <h3>PUT - Actualizar respuesta del último registro</h3>
                        <select 
                            value={editIndex} 
                            onChange={(e) => setEditIndex(Number(e.target.value))}
                            disabled={!lastRecord}
                        >
                            {lastRecord && lastRecord.data.map((_, index) => (
                                <option key={index} value={index}>Respuesta {index + 1}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="Nueva respuesta"
                            disabled={!lastRecord}
                        />
                        <button onClick={handlePut} disabled={!newAnswer || !lastRecord}>Actualizar</button>
                    </div>

                    <div className="operation">
                        <h3>DELETE - Eliminar respuesta del último registro</h3>
                        <select 
                            value={deleteIndex} 
                            onChange={(e) => setDeleteIndex(Number(e.target.value))}
                            disabled={!lastRecord}
                        >
                            {lastRecord && lastRecord.data.map((_, index) => (
                                <option key={index} value={index}>Respuesta {index + 1}</option>
                            ))}
                        </select>
                        <button onClick={handleDelete} disabled={!lastRecord}>Eliminar</button>
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
