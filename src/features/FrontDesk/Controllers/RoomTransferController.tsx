import React, { useEffect } from 'react';
import RoomTransferView from '../Views/RoomTransferView';

const RoomTransferController: React.FC = () => {
  useEffect(() => {
    // Initialize room transfer data or perform any setup
    console.log('Room transfer controller mounted');
  }, []);

  return <RoomTransferView />;
};

export default RoomTransferController;