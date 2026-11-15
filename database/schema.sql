-- ==============================================================================
-- ACADEMIC CLOUD PLATFORM - POSTGRESQL RELATIONAL SCHEMA
-- Implements tables as specified in System Design Document (Section 8 & 19):
-- • users: Authentication, password hash, role management
-- • documents: Metadata, file size, MIME type, MinIO storage key
-- • document_access_logs: Audit trail of upload, download, and deletion actions
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'auditor', 'executive')),
    department VARCHAR(100) DEFAULT 'Computer Science & Engineering',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Table: documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    storage_bucket VARCHAR(100) NOT NULL DEFAULT 'academic-documents',
    storage_key VARCHAR(255) UNIQUE NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploader_name VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('assignment', 'project_report', 'lab_record', 'contract', 'blueprint', 'financial_report', 'policy', 'other')),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploader_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_code);
CREATE INDEX IF NOT EXISTS idx_documents_storage_key ON documents(storage_key);

-- Table: document_access_logs
CREATE TABLE IF NOT EXISTS document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    action VARCHAR(20) NOT NULL CHECK (action IN ('upload', 'download', 'view', 'delete')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'unauthorized')),
    ip_address VARCHAR(45),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON document_access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_document ON document_access_logs(document_id);

-- Seed Initial Default Demo Users (password for both is 'password123')
-- Bcrypt hash for 'password123': $2b$12$e80yq9w.g22Z14m3L2s3UeQ2nZqQeB77rK9.B9k8I9IqL1pS1pW2G (or auto-seeded by auth-service)
INSERT INTO users (id, username, email, password_hash, full_name, role)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'student1', 'student1@university.edu', '$2b$12$K1r.mZ7Qd5y1y6b1K3q7zeH6e0YVnQy3M9V8V8V8V8V8V8V8V8V8V', 'Student Demo User', 'student'),
    ('a0000000-0000-0000-0000-000000000002', 'teacher1', 'teacher1@university.edu', '$2b$12$K1r.mZ7Qd5y1y6b1K3q7zeH6e0YVnQy3M9V8V8V8V8V8V8V8V8V8V', 'Professor Demo User', 'teacher')
ON CONFLICT (username) DO NOTHING;
