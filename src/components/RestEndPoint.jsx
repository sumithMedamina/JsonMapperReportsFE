import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import JsonContext from "./JsonContext";

const RestEndpoint = () => {
  const { setSourceJson } = useContext(JsonContext);
  const [url, setUrl] = useState("https://fakestoreapi.com/products");
  const navigate = useNavigate();

  const handleSaveData = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSourceJson(data);
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
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button className="btn btn-primary mt-3" onClick={handleSaveData}>
        Save Data
      </button>
    </div>
  );
};

export default RestEndpoint;
