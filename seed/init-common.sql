CREATE TABLE IF NOT EXISTS document_status (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP
);

INSERT INTO document_status (status_name) VALUES
('Draft'),
('Pending Review'),
('Approved'),
('Rejected'),
('Archived'),
('On Hold');
