import React from 'react';
import { observer } from 'mobx-react-lite';
import HousekeepingRoomsView from '../Views/HousekeepingRoomsView';

/**
 * HousekeepingRoomsController - Controller for room status management
 * Handles room status management and cleaning workflow
 */
const HousekeepingRoomsController: React.FC = observer(() => {
  return <HousekeepingRoomsView />;
});

export default HousekeepingRoomsController;