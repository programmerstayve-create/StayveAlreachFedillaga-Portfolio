-- Drop existing table (if you want fresh) or alter it
-- ALTER TABLE projects ADD COLUMN live_demo INTEGER DEFAULT 1;
-- ALTER TABLE projects ADD COLUMN images TEXT DEFAULT '';

-- Or drop and recreate (WARNING: deletes existing data)
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech TEXT NOT NULL,
    link TEXT NOT NULL,
    live_demo INTEGER DEFAULT 1,
    images TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add default projects
INSERT INTO projects (title, description, tech, link, live_demo, images) VALUES
    ('MPDC Portal', 'Web-based permit processing system for a government office. Features authentication, role-based access, fee calculations, and printable documents.', 'PostgreSQL, Auth, RBAC', 'https://alc-mpdc.netlify.app', 1, ''),
    ('Stayve Marketplace', 'A virtual item trading platform for in-game items. Includes product listings, checkout flow, and real-time order updates using Firebase.', 'Firebase, Firestore, JS', 'https://fedillagapantujan.web.app/index.html', 1, ''),
    ('RideRescue', 'Roadside assistance mobile app built with React Native. Developed key screens, connected to Supabase backend, and performed extensive testing.', 'React Native, Supabase, QA', '#', 0, '');