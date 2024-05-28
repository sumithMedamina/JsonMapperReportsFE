import React, { useContext, useState } from 'react';
import JsonContext from './JsonContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Rebrand = () => {
  const { url } = useContext(JsonContext);
  const [rebrandedData, setRebrandedData] = useState(null);
  const [rebrandedUrl, setRebrandedUrl] = useState('');

  const extractPathFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (error) {
      // If the URL is invalid, consider it as a path
      if (url.startsWith('/')) {
        return url;
      }
      console.error('Invalid URL:', error);
      return '';
    }
  };

  const handleRebrand = async () => {
    try {
      const path = extractPathFromUrl(url);

      if (!path) {
        throw new Error('Invalid URL');
      }

      const response = await fetch('http://localhost:5000/api/rebrand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: path }),
      });

      if (!response.ok) {
        throw new Error('Failed to rebrand URL');
      }

      const data = await response.json();
      console.log('Rebranded URL data saved:', data);

      // Update the input box with the rebranded URL path
      setRebrandedUrl(data.path);
      setRebrandedData(data.data); // Display the data immediately if needed
    } catch (error) {
      console.error('Error rebranding URL:', error);
    }
  };

  const handleFetch = async () => {
    try {
      const response = await fetch(`http://localhost:5000${rebrandedUrl}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setRebrandedData(data);
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Rebrand URL</h5>
          <button onClick={handleRebrand} className="btn btn-primary mb-3">Rebrand URL</button>
          <div className="input-group mb-3">
            <input 
              type="text" 
              className="form-control" 
              value={rebrandedUrl} 
              onChange={(e) => setRebrandedUrl(e.target.value)} 
              placeholder="Rebranded URL will appear here" 
            />
            <button onClick={handleFetch} className="btn btn-secondary">Fetch</button>
          </div>
          {rebrandedData && (
            <div>
              <h5>Rebranded Data</h5>
              <pre>{JSON.stringify(rebrandedData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rebrand;
