import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import RoomManagementView from '../Views/RoomManagementView';

/**
 * RoomManagementController - Controller for room management
 * Handles room grid display, quick actions, and integration with other features
 */
const RoomManagementController: React.FC = observer(() => {
    useEffect(() => {
        // Any initialization can be done here if needed
        console.log('Room Management Controller mounted');
    }, []);

    return <RoomManagementView />;
});

export default RoomManagementController;