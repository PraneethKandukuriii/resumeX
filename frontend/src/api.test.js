import { login, uploadResume, fetchLast } from './api';

global.fetch = jest.fn();

describe('API Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('login should store token on success', async () => {
    const mockResponse = { access: 'mockToken' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await login('test@example.com');
    expect(data).toEqual(mockResponse);
    expect(localStorage.getItem('token')).toBe('mockToken');
  });

  test('uploadResume should throw error if user is not authenticated', async () => {
    await expect(uploadResume(new File([], 'resume.pdf'))).rejects.toThrow(
      'User is not authenticated'
    );
  });

  test('uploadResume should call API with correct headers and body', async () => {
    localStorage.setItem('token', 'mockToken');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const file = new File(['content'], 'resume.pdf');
    const data = await uploadResume(file);

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/upload/', {
      method: 'POST',
      headers: { Authorization: 'Bearer mockToken' },
      body: expect.any(FormData),
    });
    expect(data).toEqual({ success: true });
  });

  test('fetchLast should throw error if user is not authenticated', async () => {
    await expect(fetchLast()).rejects.toThrow('User is not authenticated');
  });

  test('fetchLast should call API with correct headers', async () => {
    localStorage.setItem('token', 'mockToken');
    const mockResponse = { last: 'mockData' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await fetchLast();

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/last/', {
      method: 'GET',
      headers: { Authorization: 'Bearer mockToken' },
    });
    expect(data).toEqual(mockResponse);
  });
});
