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
    cinema_hall VARCHAR(255) NOT NULL,
    screen_name VARCHAR(50) NOT NULL DEFAULT 'IMAX 3D Laser - Screen 1',
    show_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INT NOT NULL DEFAULT 60,
    available_seats INT NOT NULL DEFAULT 60,
    price_vip NUMERIC(10,2) NOT NULL DEFAULT 800.00,
    price_premium NUMERIC(10,2) NOT NULL DEFAULT 500.00,
    price_classic NUMERIC(10,2) NOT NULL DEFAULT 350.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON flash_sale_audit(created_at DESC);

-- Seed Default Movie & 60 Seats
DO $$
DECLARE
    v_show_id UUID;
    v_row CHAR(1);
    v_col INT;
    v_tier VARCHAR(20);
    v_price NUMERIC(10,2);
    v_seat_num VARCHAR(10);
BEGIN
    -- Delete old show seeds if present
    DELETE FROM shows WHERE movie_title = 'Deadpool & Wolverine (IMAX 3D)';

    INSERT INTO shows (movie_title, poster_url, cinema_hall, screen_name, show_time, total_seats, available_seats, price_vip, price_premium, price_classic)
    VALUES (
        'Deadpool & Wolverine (IMAX 3D)',
        'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        'PVR Directors Cut - Audi 4 (Dolby Atmos)',
        'IMAX 3D Laser',
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        60,
        60,
        800.00,
        500.00,
        350.00
    )
    RETURNING id INTO v_show_id;

    -- Generate 60 Seats: Row A (VIP), Rows B-C (PREMIUM), Rows D-F (CLASSIC)
    FOR v_row IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
        IF v_row = 'A' THEN
            v_tier := 'VIP';
            v_price := 800.00;
        ELSIF v_row IN ('B', 'C') THEN
            v_tier := 'PREMIUM';
            v_price := 500.00;
        ELSE
            v_tier := 'CLASSIC';
            v_price := 350.00;
        END IF;

        FOR v_col IN 1..10 LOOP
            v_seat_num := v_row || v_col;
            INSERT INTO seats (show_id, seat_number, row_char, col_num, tier, price, status)
            VALUES (v_show_id, v_seat_num, v_row, v_col, v_tier, v_price, 'AVAILABLE')
            ON CONFLICT (show_id, seat_number) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
