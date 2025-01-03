
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

const socket = io('https://db.estudiobeguier.com', {
    withCredentials: true,
});

function App() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [surveyData, setSurveyData] = useState(null);
    const [showForm, setShowForm] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
    });

    const questions = [
        {
            questionText: '¿Cuál es tu deporte favorito?',
            answerOptions: [
                { answerText: 'Fútbol', isCorrect: false },
                { answerText: 'Baloncesto', isCorrect: false },
                { answerText: 'Tenis', isCorrect: false },
                { answerText: 'Natación', isCorrect: false },
            ],
        },
        {
            questionText: '¿Con qué frecuencia practicas deporte?',
            answerOptions: [
                { answerText: 'Diariamente', isCorrect: false },
                { answerText: 'Semanalmente', isCorrect: false },
                { answerText: 'Mensualmente', isCorrect: false },
                { answerText: 'Raramente', isCorrect: false },
            ],
        },
        {
            questionText: '¿Cuál es tu principal motivación para hacer deporte?',
            answerOptions: [
                { answerText: 'Salud', isCorrect: false },
                { answerText: 'Diversión', isCorrect: false },
                { answerText: 'Competición', isCorrect: false },
                { answerText: 'Socializar', isCorrect: false },
            ],
        },
        {
            questionText: '¿Prefieres deportes individuales o en equipo?',
            answerOptions: [
                { answerText: 'Individuales', isCorrect: false },
                { answerText: 'En equipo', isCorrect: false },
                { answerText: 'Ambos por igual', isCorrect: false },
                { answerText: 'Depende del deporte', isCorrect: false },
            ],
        },
        {
            questionText: '¿Qué factor consideras más importante al elegir un deporte?',
            answerOptions: [
                { answerText: 'Facilidad de aprendizaje', isCorrect: false },
                { answerText: 'Beneficios para la salud', isCorrect: false },
                { answerText: 'Disponibilidad de instalaciones', isCorrect: false },
                { answerText: 'Popularidad', isCorrect: false },
            ],
        },
    ];

    useEffect(() => {
        socket.on('projectData', (data) => {
            console.log('Datos recibidos:', data);
            setSurveyData(data);
        });

        socket.on('writeSuccess', (response) => {
            console.log('Datos guardados exitosamente:', response);
        });

        return () => {
            socket.off('projectData');
            socket.off('writeSuccess');
        };
    }, []);

    const handleAnswerOptionClick = (answerText) => {
        setAnswers([...answers, { question: questions[currentQuestion].questionText, answer: answerText }]);

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            setShowScore(true);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
    };

    const handleSubmitSurvey = () => {
        const surveyResult = {
            id: uuidv4(),
            ...formData,
            answers: answers,
            timestamp: new Date().toISOString(),
        };

        socket.emit('writeProject', { project: projectName, data: surveyResult });

        // Reiniciar el estado para una nueva encuesta
        setCurrentQuestion(0);
        setShowScore(false);
        setScore(0);
        setAnswers([]);
        setShowForm(true);
        setFormData({
            name: '',
            email: '',
            age: '',
            gender: '',
        });
    };

    const handleReadProject = () => {
        socket.emit('readProject', projectName);
    };

    return (
        <div className="app">
            {showForm ? (
                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nombre"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Edad"
                        required
                    />
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Selecciona género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                    <button type="submit">Comenzar encuesta</button>
                </form>
            ) : showScore ? (
                <div className="score-section">
                    <h2>Gracias por completar la encuesta</h2>
                    <button onClick={handleSubmitSurvey}>Enviar respuestas</button>
                </div>
            ) : (
                <>
                    <div className="question-section">
                        <div className="question-count">
                            <span>Pregunta {currentQuestion + 1}</span>/{questions.length}
                        </div>
                        <div className="question-text">{questions[currentQuestion].questionText}</div>
                    </div>
                    <div className="answer-section">
                        {questions[currentQuestion].answerOptions.map((answerOption, index) => (
                            <button key={index} onClick={() => handleAnswerOptionClick(answerOption.answerText)}>
                                {answerOption.answerText}
                            </button>
                        ))}
                    </div>
                </>
            )}
            <div>
                <input
                    type="text"
                    value={projectName}
                    onChange={handleProjectNameChange}
                    placeholder="Nombre del proyecto"
                />
                <button onClick={handleReadProject}>Cargar proyecto</button>
            </div>
            {surveyData && (
                <div>
                    <h3>Datos del proyecto:</h3>
                    <pre>{JSON.stringify(surveyData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;

