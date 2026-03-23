// MongoDB initialization script — runs once on first container start.
// Creates the application database and a limited user for the app connection.
db = db.getSiblingDB('moment-seekers');

db.createUser({
  user: 'mss_app',
  pwd: 'app_password_change_me',
  roles: [{ role: 'readWrite', db: 'moment-seekers' }],
});

// Sample admin user (password: Admin@1234 — bcrypt hash below)
db.users.insertOne({
  email: 'admin@momentseekerstudio.com',
  name: 'Admin',
  // bcrypt of 'Admin@1234' with 12 rounds
  passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewI3bnfBgA4Kq5ly',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('MongoDB initialization complete.');
