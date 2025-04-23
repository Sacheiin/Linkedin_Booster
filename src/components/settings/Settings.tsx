import React, { useState } from 'react';
import styles from '../../../popup/styles/popup.module.css';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await chrome.runtime.sendMessage({
        type: 'setStorageData',
        data: { apiKey: apiKey.trim() }
      });
      setMessage('API key saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving API key');
      console.error('Storage error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>API Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="apiKey">Gemini API Key:</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className={styles.generateButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Key'}
        </button>
        {message && <div className={styles.message}>{message}</div>}
      </form>
    </div>
  );
};