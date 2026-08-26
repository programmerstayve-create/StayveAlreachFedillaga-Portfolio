-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some default projects (optional)
INSERT INTO projects (title, description, tech, link) VALUES
    ('MPDC Portal', 'Web-based permit processing system for a government office. Features authentication, role-based access, fee calculations, and printable documents.', 'PostgreSQL, Auth, RBAC', 'https://alc-mpdc.netlify.app'),
    ('Stayve Marketplace', 'A virtual item trading platform for in-game items. Includes product listings, checkout flow, and real-time order updates using Firebase.', 'Firebase, Firestore, JS', 'https://fedillagapantujan.web.app/index.html'),
    ('RideRescue', 'Roadside assistance mobile app built with React Native. Developed key screens, connected to Supabase backend, and performed extensive testing.', 'React Native, Supabase, QA', '#');