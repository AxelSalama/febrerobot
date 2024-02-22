import express from "express";
import cors from "cors";
import {
  getTodo,
  shareTodo,
  deleteTodo,
  getTodosByID,
  createTodo,
  toggleCompleted,
  getUserByEmail,
  getUserByID,
  getSharedTodoByID,
} from "./database.js";
import multer from "multer"; // Importar multer para manejar archivos
import path from "path";
import fs from "fs";


const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["POST", "GET", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


const app = express();
app.use(express.json());
app.use(cors(corsOptions));


// Configurar Multer para subir archivos adjuntos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Guardar archivos en la carpeta "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Usar el nombre original del archivo
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 10MB limit for file size
});


// Ruta para subir archivos adjuntos
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).send({ message: "No se ha subido ningún archivo." });
      return;
    }
    res.status(200).send({ message: "Archivo subido exitosamente", filename: file.originalname });
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    res.status(500).send({ message: "Error al subir el archivo." });
  }
});


// Descargar archivos adjuntos
app.get("/download/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).send({ message: "Archivo no encontrado." });
      return;
    }
    res.download(filePath, filename);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    res.status(500).send({ message: "Error al descargar el archivo." });
  }
});


// Obtener todos los todos
app.get("/todos/:id", async (req, res) => {
  try {
    const todos = await getTodosByID(req.params.id);
    res.status(200).send(todos);
  } catch (error) {
    console.error("Error al obtener todos:", error);
    res.status(500).send({ message: "Error al obtener todos." });
  }
});


// Obtener un todo específico por su ID
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await getTodo(req.params.id);
    if (!todo) {
      res.status(404).send({ message: "Todo no encontrado." });
      return;
    }
    res.status(200).send(todo);
  } catch (error) {
    console.error("Error al obtener todo:", error);
    res.status(500).send({ message: "Error al obtener todo." });
  }
});


// Crear un nuevo todo
app.post("/todos", async (req, res) => {
  try {
    const { user_id, title, deadline, category, priority, notes, attachmentPath } = req.body;
    const todo = await createTodo(user_id, title, deadline, category, priority, notes, attachmentPath);
    res.status(201).send(todo);
  } catch (error) {
    console.error("Error al crear un nuevo todo:", error);
    res.status(500).send({ message: "Error al crear un nuevo todo." });
  }
});


// Completar un todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { value } = req.body;
    const todo = await toggleCompleted(req.params.id, value);
    res.status(200).send(todo);
  } catch (error) {
    console.error("Error al completar un todo:", error);
    res.status(500).send({ message: "Error al completar un todo." });
  }
});


// Compartir un todo
app.post("/todos/shared_todos", async (req, res) => {
  try {
    const { todo_id, user_id, shared_with_id, deadline, category, priority, notes, attachments } = req.body;
    const sharedTodo = await shareTodo(todo_id, user_id, shared_with_id, deadline, category, priority, notes, attachments);
    res.status(201).send(sharedTodo);
  } catch (error) {
    console.error("Error al compartir un todo:", error);
    res.status(500).send({ message: "Error al compartir un todo." });
  }
});


// Eliminar un todo
app.delete("/todos/:id", async (req, res) => {
  try {
    await deleteTodo(req.params.id);
    res.status(200).send({ message: "Todo eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar un todo:", error);
    res.status(500).send({ message: "Error al eliminar un todo." });
  }
});


// Obtener información de un usuario por su ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserByID(req.params.id);
    if (!user) {
      res.status(404).send({ message: "Usuario no encontrado." });
      return;
    }
    res.status(200).send(user);
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).send({ message: "Error al obtener información del usuario." });
  }
});


const port = 8080;


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
