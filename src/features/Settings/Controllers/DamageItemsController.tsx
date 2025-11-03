import React, { useEffect } from 'react';
import DamageItemsView from '../Views/DamageItemsView.tsx';

const DamageItemsController: React.FC = () => {
  useEffect(() => {
    // Initialize damage items data or perform any setup
    console.log('Damage items controller mounted');
  }, []);

  return <DamageItemsView />;
};

export default DamageItemsController;