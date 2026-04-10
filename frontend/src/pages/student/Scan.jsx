import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Scan.css';

export default function Scan() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Please enter your Student ID.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/student/mark-attendance', {
        studentId: studentId.trim(),
        sessionId
      });
      
      if (res.data.success) {
        setMessage(res.data.message);
      } else {
        setError(res.data.message || 'Failed to mark attendance.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="scan-root">
        <div className="scan-box">
          <h2 className="scan-title text-red">Error</h2>
          <p className="scan-desc">Invalid or missing session ID in the URL. Please scan the QR code again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-root">
      <div className="scan-box">
        <h2 className="scan-title">Scan Attendance</h2>
        <p className="scan-desc">You are marking attendance for session: <strong>{sessionId}</strong></p>
        
        {message ? (
          <div className="scan-success">
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>{message}</h3>
            <p>You can now close this tab.</p>
          </div>
        ) : (
          <form onSubmit={handleMarkAttendance} className="scan-form">
            <div className="scan-form-group">
              <label>Student ID</label>
              <input 
                type="text" 
                placeholder="e.g. S101" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)}
                autoFocus
              />
            </div>
            
            {error && <div className="scan-error-msg">{error}</div>}
            
            <button type="submit" className="scan-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Mark Attendance'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
