import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

function DragDropWrapper({ children, onDragEnd }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}

export default DragDropWrapper; 