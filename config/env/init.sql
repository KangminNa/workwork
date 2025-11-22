------------------------------------------------------------
-- EXTENSIONS
------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------------------------------------------------
-- USERS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------------------------------------------------------------
-- EVENTS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    start_at TIMESTAMPTZ NOT NULL,
    end_at   TIMESTAMPTZ NOT NULL,

    is_all_day BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CHECK (end_at > start_at)
);

------------------------------------------------------------
-- EVENT INDEXES
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_start_date
    ON events (date(start_at));

CREATE INDEX IF NOT EXISTS idx_events_start_hour
    ON events (extract(hour FROM start_at));

CREATE INDEX IF NOT EXISTS idx_events_user
    ON events (user_id);

------------------------------------------------------------
-- HOURLY NOTIFICATION DEFAULT (24시간)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_notification_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    hour SMALLINT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, hour)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_hourly_user
    ON user_notification_hourly (user_id);

------------------------------------------------------------
-- HOURLY NOTIFICATION OVERRIDE (특정 날짜)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_notification_hourly_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    target_date DATE NOT NULL,
    hour SMALLINT NOT NULL CHECK (hour >= 0 AND hour <= 23),

    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, target_date, hour)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_hourly_overrides
    ON user_notification_hourly_overrides (user_id, target_date);