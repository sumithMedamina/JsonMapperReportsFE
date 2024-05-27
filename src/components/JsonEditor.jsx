import React, { useState, useEffect } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';

function JsonEditor() {
  const [fetchUrl, setFetchUrl] = useState('https://fakestoreapi.com/products');
  const [postUrl, setPostUrl] = useState('http://localhost:5000/api/items');
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState({});
  const [editorKey, setEditorKey] = useState(0); // Key to force remount of Editor

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log('Fetched Data:', result);
      setJsonData(result);
      setEditorKey(prevKey => prevKey + 1); // Increment key to force reload of Editor
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data from the API.');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        alert('Data saved successfully!');
      } else {
        alert('Failed to save data.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data.');
    }
  };

  useEffect(() => {
    console.log('Updated JSON Data:', jsonData);
  }, [jsonData]);

  return (
    <div className="container d-flex flex-column">
      <h1>Fetch and Save Data</h1>
      <div className="mb-3">
        <label className="form-label">Fetch API URL:</label>
        <input
          type="text"
          className="form-control"
          value={fetchUrl}
          onChange={(e) => setFetchUrl(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary w-25 my-2"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      <div className="mb-3 mt-1">
        <label className="form-label">Save API URL:</label>
        <input
          type="text"
          className="form-control"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />
      </div>
      
      <div className="mt-3">
        <h3>JSON Editor:</h3>
        <Editor
          key={editorKey} // Add key prop to force remount of Editor
          value={jsonData}
          onChange={setJsonData}
          modes={['tree', 'code']}
          mode="tree"
          history={true}
          search={true}
          indentation={4}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={saveData}
          disabled={loading}
        >
          Save Data
        </button>
      </div>
    </div>
  );
}

export default JsonEditor;
