import React from 'react';
import DraggableKey from './DraggableKey';
import DroppableKey from './DroppableKey';

const JsonObject = ({ obj, isSource, parentKey, mappings, handleCancelMapping, handleDrop, renderObject, sourceRefs, targetRefs }) => {
  if (!obj) return null;

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

export default JsonObject;
