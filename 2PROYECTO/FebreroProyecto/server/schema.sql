CREATE DATABASE ProyectoFinal;

USE ProyectoFinal;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (255),
    email VARCHAR (255) UNIQUE NOT NULL,
    password VARCHAR(255)
);

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  completed BOOLEAN DEFAULT false,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);

CREATE TABLE shared_todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  todo_id INT,
  user_id INT,
  shared_with_id INT,
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password) VALUES ('Beto', 'user1@example.com', 'password1');
INSERT INTO users (name, email, password) VALUES ('Alberto', 'user2@example.com', 'password2');

INSERT INTO todos (title, user_id) 
VALUES 
("Salir a correr por la mañana", 1),
("Trabajar en la presentación del proyecto", 1),
("Ir al supermercado", 1),
("Leer 30 páginas de un libro", 1),
("Andar en bicicleta por la plaza", 1),
("Cocinar la cena para la familia", 1),
("Jugar al Futbol", 1),
("Escuchar un podcast", 1),
("Limpira la casa", 1),
("Dormir la siesta", 1);

INSERT INTO shared_todos (todo_id, user_id, shared_with_id) VALUES (1, 1, 2);

SELECT todos.*, shared_todos.shared_with_id
FROM todos
LEFT JOIN shared_todos ON todos.id = shared_todos.todo_id
WHERE todos.user_id = [user_id] OR shared_todos.shared_with_id = [user_id];

ALTER TABLE todos MODIFY COLUMN deadline DATE NULL;
