CREATE DATABASE budget_app;
GO

USE budget_app;
GO

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE budgets (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  client_name VARCHAR(255),
  materials_total DECIMAL(10,2),
  operational_total DECIMAL(10,2),
  administrative_cost DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  iva DECIMAL(10,2),
  grand_total DECIMAL(10,2),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE budget_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  budget_id INT NOT NULL,
  description TEXT,
  quantity INT,
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2),
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

CREATE TABLE company_data (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255),
  slogan TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  logo_path VARCHAR(255),
  thank_you_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
