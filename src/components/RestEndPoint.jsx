import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JsonContext from "./JsonContext";

const RestEndpoint = () => {
  const { setSourceJson, url, setUrl } = useContext(JsonContext);
  const [urlInput, setUrlInput] = useState(url); // Initialize with the URL from context
  const navigate = useNavigate();

  useEffect(() => {
    setUrlInput(url); // Update the input value when URL changes
  }, [url]);

  const handleSaveData = async () => {
    try {
      const response = await fetch(urlInput);
      const data = await response.json();
      setSourceJson(data);
      setUrl(urlInput); // Save the URL in the context
      alert("Data saved to source");
      navigate("/schema-builder");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="mt-3">
      <label className="form-label">Enter URL:</label>
      <input
        type="text"
        className="form-control"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />
      <button className="btn btn-primary mt-3" onClick={handleSaveData}>
        Save Data
      </button>
    </div>
  );
};

export default RestEndpoint;
