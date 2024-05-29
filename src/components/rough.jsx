import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import JsonContext from './JsonContext';
import { useNavigate } from 'react-router-dom';

const JsonMapper = () => {
  const { url, sourceJson, targetJson } = useContext(JsonContext);
  const [mappings, setMappings] = useState([]);
  const [updatedSourceJson, setUpdatedSourceJson] = useState('');
  const navigate = useNavigate();

  const sourceRefs = useRef({});
  const targetRefs = useRef({});

  useLayoutEffect(() => {
    const updatedJson = sourceJson.map((obj) => {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        const mapping = mappings.find((m) => m.source === key);
        if (mapping) {
          const nestedKeys = mapping.target.split('.');
          let tempObj = newObj;
          nestedKeys.forEach((nestedKey, index) => {
            if (index === nestedKeys.length - 1) {
              tempObj[nestedKey] = obj[key];
            } else {
              tempObj[nestedKey] = tempObj[nestedKey] || {};
              tempObj = tempObj[nestedKey];
            }
          });
        } else {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    });
    setUpdatedSourceJson(JSON.stringify(updatedJson, null, 2));
  }, [mappings, sourceJson]);

  const handleDragStart = (event, key) => {
    event.dataTransfer.setData('sourceKey', key);
  };

  const handleDrop = (event, targetKey) => {
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData('sourceKey');

    const existingMapping = mappings.find((m) => m.source === sourceKey);
    if (existingMapping) {
      setMappings(mappings.map((m) => (m.source === sourceKey ? { source: sourceKey, target: targetKey } : m)));
    } else {
      setMappings([...mappings, { source: sourceKey, target: targetKey }]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveMapping = (sourceKey) => {
    setMappings(mappings.filter((m) => m.source !== sourceKey));
  };

  const renderObject = (obj, prefix = '', isSource = false) => {
    return (
      <ul className="list-group">
        {Object.entries(obj).map(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const mapping = mappings.find((m) => m.source === fullKey);
          if (typeof value === 'object' && value !== null) {
            return (
              <li key={fullKey} className="list-group-item">
                <span className="fw-bold">{key}:</span>
                {renderObject(value, fullKey, isSource)}
                {mapping && isSource && (
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleRemoveMapping(mapping.source)}>
                    &times;
                  </button>
                )}
              </li>
            );
          } else {
            return (
              <li
                key={fullKey}
                ref={(el) => {
                  if (isSource) sourceRefs.current[fullKey] = el;
                  else targetRefs.current[fullKey] = el;
                }}
                className="list-group-item d-flex justify-content-between align-items-center"
                draggable={isSource}
                onDragStart={isSource ? (e) => handleDragStart(e, fullKey) : null}
                onDrop={isSource ? null : (e) => handleDrop(e, fullKey)}
                onDragOver={isSource ? null : handleDragOver}
              >
                <span className="fw-bold">{key}:</span> {JSON.stringify(value)}
                {mapping && isSource && (
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleRemoveMapping(mapping.source)}>
                    &times;
                  </button>
                )}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  const renderMappings = () => {
    console.log("sourceRefs:", sourceRefs.current);
    console.log("targetRefs:", targetRefs.current);
  
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];
    return mappings.map((mapping, index) => {
      const sourceElement = sourceRefs.current[mapping.source];
      const targetElement = targetRefs.current[mapping.target];
      if (sourceElement && targetElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const sourceX = sourceRect.right + 5 + window.scrollX;
        const sourceY = sourceRect.top + sourceRect.height / 2 + window.scrollY;
        const targetX = targetRect.left - 5 + window.scrollX;
        const targetY = targetRect.top + targetRect.height / 2 + window.scrollY;

        const color = colors[index % colors.length];

        return (
          <line
            key={index}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={color}
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        );
      }
      return null;
    });
  };

  const saveUpdatedJson = () => {
    const jsonData = JSON.parse(updatedSourceJson);

    fetch('http://localhost:5000/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: url, data: jsonData })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        alert('Data saved successfully');
        return response.json();
      })
      .then((data) => {
        console.log('Data saved successfully:', data);
        navigate('/rebrand');
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3>Source JSON</h3>
            </div>
            <div className="card-body">{renderObject(sourceJson[0], '', true)}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h3>Target JSON</h3>
            </div>
            <div className="card-body">{renderObject(targetJson)}</div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button className="btn btn-primary" onClick={saveUpdatedJson}>
            Save Updated JSON
          </button>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h3>Updated Source JSON</h3>
            </div>
            <div className="card-body">
              <pre>{updatedSourceJson}</pre>
            </div>
          </div>
        </div>
      </div>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#000" />
          </marker>
        </defs>
        {renderMappings()}
      </svg>
    </div>
  );
};

export default JsonMapper;
