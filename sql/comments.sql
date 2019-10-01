DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id SERIAL primary key,
    username VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    images_id INTEGER REFERENCES images(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
