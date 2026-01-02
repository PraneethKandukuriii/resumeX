const API = "https://resumex-api-kxjs.onrender.com"; // backend URL

// Login with email
export async function login(email) {
  try {
    const res = await fetch(`${API}/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.access);
      return data;
    }

    throw new Error(data.error || data.detail || 'Login failed');
  } catch (err) {
    console.error('Login failed:', err);
    throw err;
  }
}

// Upload resume file
export async function uploadResume(file) {
  const fd = new FormData();
  fd.append('resume', file);

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API}/api/upload/`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: fd,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Upload failed');
    }

    return await res.json();
  } catch (err) {
    console.error('Resume upload failed:', err);
    throw err;
  }
}

// Fetch last uploaded resume result
export async function fetchLast() {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API}/api/last/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Fetch last result failed');
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch last resume failed:', err);
    throw err;
  }
}
