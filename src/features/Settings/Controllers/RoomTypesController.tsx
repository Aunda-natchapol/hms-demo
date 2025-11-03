import React, { useEffect } from 'react';
import RoomTypesView from '../Views/RoomTypesView';

const RoomTypesController: React.FC = () => {
  useEffect(() => {
    // Initialize room types data or perform any setup
    console.log('Room types controller mounted');
  }, []);

  return <RoomTypesView />;
};

export default RoomTypesController;