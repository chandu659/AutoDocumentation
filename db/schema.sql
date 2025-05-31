-- Create audio_files table to store uploaded audio files
CREATE TABLE IF NOT EXISTS audio_files (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_data BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on file_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_audio_files_file_name ON audio_files(file_name);

-- Create a function to clean up old files (optional)
CREATE OR REPLACE FUNCTION cleanup_old_audio_files() RETURNS void AS $$
BEGIN
  DELETE FROM audio_files
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
