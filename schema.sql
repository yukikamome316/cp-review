CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  last_solved INTEGER,
  diff INTEGER,
  precalc_coef REAL,
  priority REAL
);

CREATE TABLE IF NOT EXISTS ac_submissions (
  id INTEGER PRIMARY KEY,
  submitted_at INTEGER,
  problem_id TEXT REFERENCES problems(id)
);

CREATE INDEX IF NOT EXISTS idx_priority ON problems (priority);
CREATE INDEX IF NOT EXISTS idx_ac_probsub ON ac_submissions (problem_id, submitted_at);
