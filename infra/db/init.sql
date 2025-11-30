CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  duration_min INT DEFAULT 60,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR NOT NULL,
  color VARCHAR DEFAULT '#000000'
);

CREATE TABLE IF NOT EXISTS schedule_labels (
  schedule_id INT REFERENCES schedules(id),
  label_id INT REFERENCES labels(id),
  PRIMARY KEY (schedule_id, label_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  schedule_id INT REFERENCES schedules(id),
  user_id INT REFERENCES users(id),
  notify_at TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS admin_requests (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  status request_status DEFAULT 'PENDING',
  requested_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  default_duration_min INT DEFAULT 60,
  notification_offset_min INT DEFAULT 10
);
