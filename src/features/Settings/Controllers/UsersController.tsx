import React, { useEffect } from 'react';
import UsersView from '../Views/UsersView';

const UsersController: React.FC = () => {
  useEffect(() => {
    // Initialize users data or perform any setup
    console.log('Users controller mounted');
  }, []);

  return <UsersView />;
};

export default UsersController;