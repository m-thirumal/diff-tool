INSERT INTO document_status (id, status_name) VALUES
(7, 'In Progress'),
(8, 'Submitted'),
(9, 'Needs Changes'),
(10, 'Published'),
(11, 'Cancelled'),
(12, 'Under Review');

UPDATE document_status SET status_name = 'On Hold' WHERE id = 6;
