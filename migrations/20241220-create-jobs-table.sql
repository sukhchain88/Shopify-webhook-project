-- Migration: Create jobs table for database-based queue system
-- This replaces Redis/BullMQ for Render free tier compatibility

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status_scheduled ON jobs(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON jobs(type, status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_jobs_processed_at ON jobs(processed_at);

-- Insert some example jobs for testing
INSERT INTO jobs (type, payload, status, scheduled_at) VALUES 
('send_email', '{"to": "test@example.com", "subject": "Test Email", "body": "This is a test email"}', 'pending', datetime('now')),
('process_webhook', '{"topic": "orders/create", "data": {"id": 12345}}', 'pending', datetime('now', '+1 minute')),
('sync_product', '{"productId": "prod_123", "action": "update"}', 'pending', datetime('now', '+5 minutes')); 