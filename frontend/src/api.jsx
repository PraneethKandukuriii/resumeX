// frontend/src/api.js
const API = 'http://127.0.0.1:8000';

// Login with email
export async function login(email) {
  const res = await fetch(`${API}/api/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.access);
  }

  return data;
}

// Upload resume file
export async function uploadResume(file) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User is not authenticated');

  const fd = new FormData();
  fd.append('resume', file);

  const res = await fetch(`${API}/api/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  return res.json();
}

// Fetch last uploaded resume result
export async function fetchLast() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User is not authenticated');

  const res = await fetch(`${API}/api/last/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
