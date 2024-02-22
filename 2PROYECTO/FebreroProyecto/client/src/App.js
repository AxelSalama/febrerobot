import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';


const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState(null);
  const [newTodoCategory, setNewTodoCategory] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('');
  const [newTodoNotes, setNewTodoNotes] = useState('');
  const [newTodoAttachment, setNewTodoAttachment] = useState(null); // Cambiado a null
  const [deleteMode, setDeleteMode] = useState(null);
  const [showNameRequiredPopup, setShowNameRequiredPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [showInvalidDatePopup, setShowInvalidDatePopup] = useState(false);
  const [invalidDateMessage, setInvalidDateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');


  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/todos/1');
        const sortedTodos = response.data.sort((a, b) => {
          const priorityValues = { Alta: 3, Media: 2, Baja: 1 };
          return priorityValues[b.priority] - priorityValues[a.priority];
        });
        setTodos(sortedTodos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };


    fetchTodos();
  }, []);


  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);


  let pressTimer;


  const startPressTimer = (id) => {
    if (deleteMode !== id) {
      setDeleteMode(id);
      pressTimer = setTimeout(() => {
        setDeleteMode(null);
      }, 1500);
    }
  };


  const endPressTimer = () => {
    clearTimeout(pressTimer);
  };


  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/todos/${id}`);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      setDeleteMode(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };


  const createNewTodo = async () => {
    try {
      if (!newTodoTitle.trim()) {
        setShowNameRequiredPopup(true);
        return;
      }


      const existingTodo = todos.find((todo) => todo.title === newTodoTitle);
      if (existingTodo) {
        setShowDuplicatePopup(true);
        return;
      }


      // Validar el formato de la fecha
      if (
        newTodoDeadline &&
        !/^\d{4}-\d{2}-\d{2}$/.test(newTodoDeadline.toISOString().slice(0, 10))
      ) {
        setShowInvalidDatePopup(true);
        setInvalidDateMessage('Ingrese una fecha válida en formato YYYY-MM-DD.');
        return;
      }


      const user_id = 1; // Este valor se está pasando directamente en el objeto de datos


      const formattedDeadline = newTodoDeadline
        ? newTodoDeadline.toISOString().slice(0, 19).replace("T", " ")
        : null;


      // Convertir el archivo adjunto a Base64
      let base64Attachment = null;
      if (newTodoAttachment) {
        base64Attachment = await convertFileToBase64(newTodoAttachment);
      }


      const response = await axios.post('http://localhost:8080/todos', {
        user_id: user_id,
        title: newTodoTitle,
        deadline: formattedDeadline,
        category: newTodoCategory,
        priority: newTodoPriority,
        notes: newTodoNotes,
        attachment: base64Attachment,
      });


      setTodos([...todos, response.data]);
      setNewTodoTitle('');
      setNewTodoDeadline(null);
      setNewTodoCategory('');
      setNewTodoPriority('');
      setNewTodoNotes('');
      setNewTodoAttachment(null); // Cambiado a null


      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };


  // Función para convertir el archivo adjunto a Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]); // Elimina el prefijo "data:image/jpeg;base64,"
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  const showAttachment = (attachment) => {
    window.open(attachment, '_blank');
  };


  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTodoAttachment(file);
    }
  };


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>TaskCentral</h1>
        <div className="themeButton" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</div>
        {showSuccessMessage && (
          <div className="success-message">
            <p>Tarea creada exitosamente.</p>
            <button onClick={() => setShowSuccessMessage(false)}>Cerrar</button>
          </div>
        )}
        <div className="tasks-list-container">
          <ul>
            {todos.map((todo) => (
              <li
                key={todo.id}
                onTouchStart={() => startPressTimer(todo.id)}
                onTouchEnd={endPressTimer}
                style={{ backgroundColor: getCategoryColor(todo.category) }}
              >
                <div className="todoWrapper">
                  <div className="checkSquare" onClick={() => setDeleteMode(null)}>
                    {todo.completed && <span>&#10003;</span>}
                  </div>
                  <div className="todoContent">
                    <div className="todoTitle">{todo.title}</div>
                    <div className="todoDetails">
                      {todo.deadline && <p>Fecha Limite: {todo.deadline}</p>}
                      {todo.category && <p>Categoria: {todo.category}</p>}
                      {todo.priority && <p>Prioridad: {todo.priority}</p>}
                      {todo.notes && <p>Notas: {todo.notes}</p>}
                      {todo.attachment && (
                        <p>
                          Adjunto:
                          <button onClick={() => showAttachment(todo.attachment)}>Ver Adjunto</button>
                        </p>
                      )}
                      {todo.created_at && (
                        <p>Fecha Creación: {formatDate(todo.created_at)}</p>
                      )}
                    </div>
                    {deleteMode === todo.id && (
                      <div className="deleteButtons">
                        <div
                          className="deleteButton"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          &#10006;
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="container">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Ingresa nueva tarea"
          />
          <DatePicker
            selected={newTodoDeadline}
            onChange={(date) => setNewTodoDeadline(date)}
            placeholderText="Selecciona una fecha limite"
            dateFormat="yyyy-MM-dd"
          />
          <select
            value={newTodoCategory}
            onChange={(e) => setNewTodoCategory(e.target.value)}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            <option value="Trabajo">Trabajo</option>
            <option value="Personal">Personal</option>
            <option value="Estudio">Estudio</option>
          </select>
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value)}
          >
            <option value="" disabled>
              Selecciona una prioridad
            </option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <input
            type="text"
            value={newTodoNotes}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                setNewTodoNotes(e.target.value);
              }
            }}
            placeholder="Notas (opcional)"
            maxLength={30}
          />
          <input
            type="file"
            onChange={handleFileChange}
          />
          <button onClick={createNewTodo}>Crear tarea</button>
        </div>
        {showNameRequiredPopup && (
          <div className="popup">
            <p>Es obligatorio ingresar un nombre para la tarea.</p>
            <button onClick={() => setShowNameRequiredPopup(false)}>Cerrar</button>
          </div>
        )}
        {showDuplicatePopup && (
          <div className="popup">
            <p>No se pueden crear dos tareas con el mismo nombre.</p>
            <button onClick={() => setShowDuplicatePopup(false)}>Cerrar</button>
          </div>
        )}
        {showInvalidDatePopup && (
          <div className="popup">
            <p>{invalidDateMessage}</p>
            <button onClick={() => setShowInvalidDatePopup(false)}>Cerrar</button>
          </div>
        )}
      </header>
    </div>
  );
}


const getCategoryColor = (category) => {
  switch (category) {
    case 'Trabajo':
      return '#ffcccb';
    case 'Personal':
      return '#c2f0c2';
    case 'Estudio':
      return '#c2e2f0';
    default:
      return '#ffffff';
  }
};


export default App;