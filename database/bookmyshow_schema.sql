-- ==============================================================================
-- BOOKMYSHOW FLASH-SALE & HIGH-CONCURRENCY SEAT BOOKING SCHEMA
-- Designed for Kubernetes Pod Affinity, Distributed Locking, & Zero Double-Booking
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: shows
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_title VARCHAR(255) NOT NULL,
    poster_url VARCHAR(500),
    banner_url VARCHAR(500),
    cinema_hall VARCHAR(255) NOT NULL,
    screen_name VARCHAR(100) NOT NULL DEFAULT 'IMAX 3D Laser - Audi 4',
    genre VARCHAR(100) DEFAULT 'Action • Sci-Fi',
    rating VARCHAR(10) DEFAULT '9.1',
    duration VARCHAR(50) DEFAULT '2h 8m',
    language VARCHAR(50) DEFAULT 'English • 3D',
    certification VARCHAR(20) DEFAULT 'UA',
    show_time TIMESTAMP WITH TIME ZONE NOT NULL,
    show_times_json TEXT DEFAULT '["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM", "11:45 PM"]',
    total_seats INT NOT NULL DEFAULT 60,
    available_seats INT NOT NULL DEFAULT 60,
    price_vip NUMERIC(10,2) NOT NULL DEFAULT 800.00,
    price_premium NUMERIC(10,2) NOT NULL DEFAULT 500.00,
    price_classic NUMERIC(10,2) NOT NULL DEFAULT 350.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist
ALTER TABLE shows ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500);
ALTER TABLE shows ADD COLUMN IF NOT EXISTS genre VARCHAR(100) DEFAULT 'Action • Sci-Fi';
ALTER TABLE shows ADD COLUMN IF NOT EXISTS rating VARCHAR(10) DEFAULT '9.1';
ALTER TABLE shows ADD COLUMN IF NOT EXISTS duration VARCHAR(50) DEFAULT '2h 8m';
ALTER TABLE shows ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English • 3D';
ALTER TABLE shows ADD COLUMN IF NOT EXISTS certification VARCHAR(20) DEFAULT 'UA';
ALTER TABLE shows ADD COLUMN IF NOT EXISTS show_times_json TEXT DEFAULT '["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM", "11:45 PM"]';

-- Table: seats
CREATE TABLE IF NOT EXISTS seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL, -- e.g. A1, B5, F10
    row_char CHAR(1) NOT NULL,         -- A, B, C, D, E, F
    col_num INT NOT NULL,              -- 1 to 10
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('VIP', 'PREMIUM', 'CLASSIC')),
    price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'BOOKED')),
    locked_by VARCHAR(100),
    lock_expires_at TIMESTAMP WITH TIME ZONE,
    booked_by VARCHAR(100),
    version INT NOT NULL DEFAULT 0,    -- Optimistic locking token
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_show_seat UNIQUE (show_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_show_status ON seats(show_id, status);
CREATE INDEX IF NOT EXISTS idx_seats_number ON seats(seat_number);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(20) UNIQUE NOT NULL, -- e.g. BMS-984721
    show_id UUID NOT NULL REFERENCES shows(id),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    seat_numbers TEXT NOT NULL,              -- Comma-separated (e.g. A1, A2)
    seats_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'EXPIRED')),
    payment_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);

-- Table: flash_sale_audit
CREATE TABLE IF NOT EXISTS flash_sale_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID,
    seat_number VARCHAR(10) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,            -- 'LOCK_ATTEMPT', 'COLLISION_PREVENTED', 'BOOKING_COMMITTED'
    outcome VARCHAR(30) NOT NULL,           -- 'SUCCESS', 'COLLISION', 'FAILED', 'EXPIRED'
    latency_ms NUMERIC(8,2) NOT NULL DEFAULT 0.0,
    worker_node VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE flash_sale_audit ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_audit_created ON flash_sale_audit(created_at DESC);

-- Seed Blockbuster Shows & Seats
DO $$
DECLARE
    rec RECORD;
    v_row CHAR(1);
    v_col INT;
    v_tier VARCHAR(20);
    v_price NUMERIC(10,2);
    v_seat_num VARCHAR(10);
BEGIN
    -- Seed Movie 1: Deadpool & Wolverine
    INSERT INTO shows (id, movie_title, poster_url, banner_url, cinema_hall, screen_name, genre, rating, duration, language, certification, show_time, total_seats, available_seats, price_vip, price_premium, price_classic)
    VALUES (
        'd5824153-5f59-4ede-bd6c-b0e321d2be56',
        'Deadpool & Wolverine (IMAX 3D)',
        'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        'https://image.tmdb.org/t/p/original/yDHYTjA3R0neXjRI5r9W6qV7h48.jpg',
        'PVR Directors Cut - Audi 4 (Dolby Atmos)',
        'IMAX 3D Laser',
        'Action • Comedy • Sci-Fi',
        '9.1',
        '2h 8m',
        'English • 3D',
        'UA',
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        60,
        60,
        800.00,
        500.00,
        350.00
    ) ON CONFLICT (id) DO UPDATE SET
        movie_title = EXCLUDED.movie_title,
        genre = EXCLUDED.genre,
        rating = EXCLUDED.rating;

    -- Seed Movie 2: Oppenheimer
    INSERT INTO shows (id, movie_title, poster_url, banner_url, cinema_hall, screen_name, genre, rating, duration, language, certification, show_time, total_seats, available_seats, price_vip, price_premium, price_classic)
    VALUES (
        'e6935264-6a6a-4fdf-ce7d-c1f432e3cf67',
        'Oppenheimer (IMAX 70mm Special)',
        'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        'PVR Superplex - Audi 1 (IMAX 70mm)',
        '70mm Ultra Large Screen',
        'Biography • Drama • History',
        '9.3',
        '3h 0m',
        'English • 70mm',
        'A',
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        60,
        60,
        950.00,
        650.00,
        400.00
    ) ON CONFLICT (id) DO UPDATE SET
        movie_title = EXCLUDED.movie_title,
        genre = EXCLUDED.genre,
        rating = EXCLUDED.rating;

    -- Seed Movie 3: Interstellar
    INSERT INTO shows (id, movie_title, poster_url, banner_url, cinema_hall, screen_name, genre, rating, duration, language, certification, show_time, total_seats, available_seats, price_vip, price_premium, price_classic)
    VALUES (
        'f7046375-7b7b-4ea1-bf8e-d2e543f4dc78',
        'Interstellar: 10th Anniversary (IMAX)',
        'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        'PVR Directors Cut - Audi 2 (Dolby Atmos)',
        'IMAX Laser 4K',
        'Sci-Fi • Adventure • Drama',
        '9.5',
        '2h 49m',
        'English • 2D',
        'UA',
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        60,
        60,
        850.00,
        550.00,
        350.00
    ) ON CONFLICT (id) DO UPDATE SET
        movie_title = EXCLUDED.movie_title,
        genre = EXCLUDED.genre,
        rating = EXCLUDED.rating;

    -- Seed Movie 4: Avatar: The Way of Water
    INSERT INTO shows (id, movie_title, poster_url, banner_url, cinema_hall, screen_name, genre, rating, duration, language, certification, show_time, total_seats, available_seats, price_vip, price_premium, price_classic)
    VALUES (
        'a1234567-8c8c-4fdb-ea9f-e3a654f5ea89',
        'Avatar: The Way of Water (IMAX 3D HFR)',
        'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
        'PVR P[XL] - Audi 3 (Dolby 7.1)',
        '48 FPS HFR 3D',
        'Sci-Fi • Action • Fantasy',
        '8.8',
        '3h 12m',
        'English • 3D',
        'UA',
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        60,
        60,
        750.00,
        450.00,
        300.00
    ) ON CONFLICT (id) DO UPDATE SET
        movie_title = EXCLUDED.movie_title,
        genre = EXCLUDED.genre,
        rating = EXCLUDED.rating;

    -- Ensure 60 seats for each show
    FOR rec IN SELECT id, price_vip, price_premium, price_classic FROM shows LOOP
        FOR v_row IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
            IF v_row = 'A' THEN
                v_tier := 'VIP';
                v_price := rec.price_vip;
            ELSIF v_row IN ('B', 'C') THEN
                v_tier := 'PREMIUM';
                v_price := rec.price_premium;
            ELSE
                v_tier := 'CLASSIC';
                v_price := rec.price_classic;
            END IF;

            FOR v_col IN 1..10 LOOP
                v_seat_num := v_row || v_col;
                INSERT INTO seats (show_id, seat_number, row_char, col_num, tier, price, status)
                VALUES (rec.id, v_seat_num, v_row, v_col, v_tier, v_price, 'AVAILABLE')
                ON CONFLICT (show_id, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
