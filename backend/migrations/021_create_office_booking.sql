-- Office Booking & Meeting Scheduler Migration
-- Creates tables for office management and meeting bookings

-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(200),
    floor VARCHAR(50),
    capacity INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    amenities JSON,
    photo_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create meeting_bookings table
CREATE TABLE IF NOT EXISTS meeting_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    organizer_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    participant_ids JSON,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES offices (id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_office_id ON meeting_bookings(office_id);
CREATE INDEX IF NOT EXISTS idx_bookings_organizer_id ON meeting_bookings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON meeting_bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON meeting_bookings(end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON meeting_bookings(status);

-- Insert sample offices
INSERT INTO offices (name, location, floor, capacity, description, amenities, is_active) VALUES
('Conference Room A', 'Main Building', 'Floor 2', 12, 'Large conference room with video conferencing', '["Projector", "Whiteboard", "Video Conference", "Phone"]', 1),
('Meeting Room B', 'Main Building', 'Floor 2', 6, 'Medium meeting room', '["Whiteboard", "TV Screen"]', 1),
('Board Room', 'Main Building', 'Floor 3', 20, 'Executive board room', '["Projector", "Video Conference", "Phone", "Whiteboard"]', 1),
('Huddle Room 1', 'Main Building', 'Floor 1', 4, 'Quick sync meetings', '["TV Screen"]', 1),
('Huddle Room 2', 'Main Building', 'Floor 1', 4, 'Quick sync meetings', '["TV Screen"]', 1),
('Training Room', 'Main Building', 'Floor 3', 30, 'Large training and presentation room', '["Projector", "Whiteboard", "Sound System"]', 1);

