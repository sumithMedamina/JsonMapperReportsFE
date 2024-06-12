import React from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
  KEY: 'key',
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

export default DroppableKey;
