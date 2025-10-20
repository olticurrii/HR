-- Migration: Add work_summary to time_entries table
-- Description: Adds work_summary field to store daily documentation when clocking out

ALTER TABLE time_entries ADD COLUMN work_summary TEXT NULL;

