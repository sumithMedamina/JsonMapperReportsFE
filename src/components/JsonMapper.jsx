import React, { useState, useContext, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import JsonContext from './JsonContext';
import { useNavigate } from 'react-router-dom';

const ItemTypes = {
  KEY: 'key',
};

const DraggableKey = ({ id, name, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.KEY,
    item: { id, name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="list-group-item">
      {children}
    </div>
  );
};

const DroppableKey = ({ id, onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.KEY,
    drop: (item) => onDrop(item, id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} style={{ backgroundColor: isOver ? 'lightyellow' : 'inherit' }} className="list-group-item">
      {children}
    </div>
  );
};

const JsonMapper = () => {
  const { sourceJson, targetJson, url } = useContext(JsonContext);
  const [mappings, setMappings] = useState([]);
  const [updatedSourceJson, setUpdatedSourceJson] = useState('');
  const navigate = useNavigate();
  const sourceRefs = useRef({});
  const targetRefs = useRef({});
  const containerRef = useRef(null);

  const applyMapping = (obj, mappings, parentKey = '') => {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => applyMapping(item, mappings, `${parentKey}`));
    }

    const newObj = {};
    Object.keys(obj).forEach(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      const mapping = mappings.find(m => m.source === fullKey);

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        newObj[mapping ? mapping.target.split('.').pop() : key] = value.map(item =>
          applyMapping(item, mappings, `${fullKey}`)
        );
      } else if (typeof value === 'object' && value !== null) {
        newObj[mapping ? mapping.target.split('.').pop() : key] = applyMapping(value, mappings, fullKey);
      } else {
        newObj[mapping ? mapping.target.split('.').pop() : key] = value;
      }
    });

    return newObj;
  };

  useEffect(() => {
    console.log("sourceJson:", sourceJson);
    if (sourceJson) {
      const updatedJson = Array.isArray(sourceJson) ? 
        sourceJson.map(obj => applyMapping(obj, mappings)) :
        [applyMapping(sourceJson, mappings)];
      setUpdatedSourceJson(JSON.stringify(updatedJson, null, 2));
    }
  }, [mappings, sourceJson]);

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
    if (!obj) return null;
  
    // If obj is an array, get the first item
    const objToRender = Array.isArray(obj) ? obj[0] : obj;
  
    return (
      <ul className="list-group">
        {Object.entries(objToRender).map(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          const mapping = mappings.find(m => m.source === fullKey);
  
          return (
            <li key={fullKey} className="list-group-item" ref={el => {
              if (isSource) sourceRefs.current[fullKey] = el;
              else targetRefs.current[fullKey] = el;
            }}>
              {isSource ? (
                <DraggableKey id={fullKey} name={fullKey}>
                  <span className="fw-bold">{key}:</span> {JSON.stringify(value)}
                  {mapping && (
                    <button className="btn btn-sm btn-danger ms-2" onClick={() => handleCancelMapping(mapping.source)}>
                      &times;
                    </button>
                  )}
                </DraggableKey>
              ) : (
                <DroppableKey id={fullKey} onDrop={handleDrop}>
                  <span className="fw-bold">{key}:</span> {JSON.stringify(value)}
                </DroppableKey>
              )}
              {Array.isArray(value) && isSource ? (
                // Only show the 0th index object in nested arrays for source JSON
                <div key={`${fullKey}[0]`} className="ms-3">
                  <span className="fw-bold">[0]</span>
                  {renderObject(value[0], isSource, `${fullKey}`)}
                </div>
              ) : (
                typeof value === 'object' && value !== null && renderObject(value, isSource, fullKey)
              )}
            </li>
          );
        })}
      </ul>
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
    </DndProvider>
  );
};

export default JsonMapper;

