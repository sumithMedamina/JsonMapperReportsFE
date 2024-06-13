import React, { useState, useContext, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import JsonContext from '../JsonContext';
import { useNavigate } from 'react-router-dom';
import JsonObject from './JsonObject';
import { Modal } from 'react-bootstrap';
import Button from '@mui/material/Button';

const JsonMapper = () => {
  const { sourceJson, targetJson, url } = useContext(JsonContext);
  const [mappings, setMappings] = useState([]);
  const [updatedSourceJson, setUpdatedSourceJson] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const sourceRefs = useRef({});
  const targetRefs = useRef({});
  const containerRef = useRef(null);

  const applyMapping = (sourceObj, targetObj, mappings, parentKey = '') => {
    const newObj = { ...targetObj }; // Initialize with targetObj

    if (Array.isArray(sourceObj)) {
      return sourceObj.map((item, index) => applyMapping(item, targetObj, mappings, `${parentKey}`));
    }

    Object.keys(sourceObj).forEach(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = sourceObj[key];
      const mapping = mappings.find(m => m.source === fullKey);

      if (mapping) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          newObj[mapping.target.split('.').pop()] = value.map(item =>
            applyMapping(item, targetObj[key], mappings, `${fullKey}`)
          );
        } else if (typeof value === 'object' && value !== null) {
          newObj[mapping.target.split('.').pop()] = applyMapping(value, targetObj[key], mappings, fullKey);
        } else {
          newObj[mapping.target.split('.').pop()] = value;
        }
      }
    });

    return newObj;
  };

  useEffect(() => {
    console.log("sourceJson:", sourceJson);
    if (sourceJson) {
      const updatedJson = Array.isArray(sourceJson) ? 
        sourceJson.map(obj => applyMapping(obj, targetJson, mappings)) :
        [applyMapping(sourceJson, targetJson, mappings)];
      setUpdatedSourceJson(JSON.stringify(updatedJson, null, 2));
    }
  }, [mappings, sourceJson, targetJson]);

  const handleDrop = (sourceItem, targetKey) => {
    const mappingExists = mappings.some(mapping => mapping.source === sourceItem.name && mapping.target === targetKey);
    if (mappingExists) {
      return;
    }

    setMappings(prevMappings => [...prevMappings, { source: sourceItem.name, target: targetKey }]);
  };

  const handleCancelMapping = sourceKey => {
    setMappings(mappings.filter(mapping => mapping.source !== sourceKey));
  };

  const renderObject = (obj, isSource = false, parentKey = '') => {
    return (
      <JsonObject
        obj={obj}
        isSource={isSource}
        parentKey={parentKey}
        mappings={mappings}
        handleCancelMapping={handleCancelMapping}
        handleDrop={handleDrop}
        renderObject={renderObject}
        sourceRefs={sourceRefs}
        targetRefs={targetRefs}
      />
    );
  };

  const renderMappings = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#00FFFF', '#FF00FF'];
    const renderedMappings = [];

    mappings.forEach((mapping, index) => {
      const sourceElement = sourceRefs.current[mapping.source];
      const targetElement = targetRefs.current[mapping.target];

      if (sourceElement && targetElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const sourceX = sourceRect.right - containerRect.left;
        const sourceY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
        const targetX = targetRect.left - containerRect.left;
        const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;

        const color = colors[index % colors.length];

        const controlX1 = sourceX + 50;
        const controlY1 = sourceY;
        const controlX2 = targetX - 50;
        const controlY2 = targetY;

        const path = `M${sourceX},${sourceY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${targetX},${targetY}`;

        renderedMappings.push(
          <path
            key={`${mapping.source}-${mapping.target}`}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        );
      }
    });

    return renderedMappings;
  };

  const saveUpdatedJson = () => {
    const jsonData = updatedSourceJson ? JSON.parse(updatedSourceJson) : {};

    fetch('http://localhost:5000/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: url, data: jsonData }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        alert('Data saved in Database');
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
    <DndProvider backend={HTML5Backend}>
      <div className="container mt-4" ref={containerRef} style={{ position: 'relative' }}>
        <div className="row d-flex justify-content-between">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h3>Source JSON</h3>
              </div>
              <div className="card-body">{renderObject(sourceJson, true)}</div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h3>Target JSON</h3>
              </div>
              <div className="card-body">{renderObject(targetJson)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 text-center my-2" >
            <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
              Show Customized JSON
            </Button>
          </div>
        </div>
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Customized JSON</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre>{updatedSourceJson}</pre>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="contained" className='mx-3' color="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="contained" color="primary" onClick={saveUpdatedJson}>
              Save Customized JSON
            </Button>
          </Modal.Footer>
        </Modal>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#000" />
            </marker>
          </defs>
          {renderMappings()}
        </svg>
      </div>
    </DndProvider>
  );
};

export default JsonMapper;
