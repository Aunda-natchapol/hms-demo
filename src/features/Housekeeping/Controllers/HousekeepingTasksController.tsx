import React from 'react';
import { observer } from 'mobx-react-lite';
import HousekeepingTasksView from '../Views/HousekeepingTasksView';

/**
 * HousekeepingTasksController - Controller for task management
 * Handles task list, assign tasks, update status
 */
const HousekeepingTasksController: React.FC = observer(() => {
  return <HousekeepingTasksView />;
});

export default HousekeepingTasksController;