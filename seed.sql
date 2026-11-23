-- Insert eight fictional IT support requests only when the table is empty.
INSERT INTO records (title, category, description, status)
SELECT seed.title, seed.category, seed.description, seed.status
FROM (VALUES
  ('Library Wi-Fi unavailable', 'Network', 'Students cannot connect to the library wireless network.', 'Pending'),
  ('Lab computer will not start', 'Hardware', 'The desktop computer in Lab 2 does not power on.', 'In progress'),
  ('Office application error', 'Software', 'The word processing application displays an error when opened.', 'Pending'),
  ('Slow internet connection', 'Network', 'Internet access in the engineering block is unusually slow.', 'Completed'),
  ('Keyboard keys not working', 'Hardware', 'Several keys on the computer keyboard do not respond.', 'Pending'),
  ('Browser keeps crashing', 'Software', 'The web browser closes unexpectedly during use.', 'In progress'),
  ('Printer connection problem', 'Hardware', 'The department printer cannot be reached from the office PC.', 'Pending'),
  ('Email access issue', 'Software', 'A student is unable to sign in to the university email application.', 'Completed')
) AS seed(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);