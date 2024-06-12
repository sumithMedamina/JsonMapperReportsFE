import React from 'react';
import { useDrag } from 'react-dnd';

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

export default DraggableKey;
