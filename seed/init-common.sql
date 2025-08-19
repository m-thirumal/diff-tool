CREATE TABLE IF NOT EXISTS document_status (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP
);

INSERT INTO document_status (id, status_name) VALUES
(1, 'Draft'),
(2, 'Pending Review'),
(3, 'Approved'),
(4, 'Rejected'),
(5, 'Archived'),
(6, 'On-Hold');
