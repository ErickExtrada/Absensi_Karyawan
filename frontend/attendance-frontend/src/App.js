import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [attendances, setAttendances] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setToken(response.data.token);
      const decoded = JSON.parse(atob(response.data.token.split('.')[1]));
      setRole(decoded.role);
    } catch (error) {
      console.error('Login failed:', error.response.data.message);
    }
  };

  const fetchAttendances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendances(response.data);
    } catch (error) {
      console.error('Failed to fetch attendances:', error.response.data.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/attendance',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      fetchAttendances();
    } catch (error) {
      console.error('Attendance failed:', error.response.data.message);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchAttendances();
    }
  }, [role, token]);

  if (!token) {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Username" 
            required 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Attendance System</h1>
      {role === 'user' && (
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name" 
            required 
          />
          <button type="submit">Submit</button>
        </form>
      )}
      {role === 'admin' && (
        <ul>
          {attendances.map((attendance) => (
            <li key={attendance._id}>
              {attendance.user.username} - {new Date(attendance.date).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
