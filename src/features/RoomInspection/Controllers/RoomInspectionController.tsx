import React from 'react';
import { observer } from 'mobx-react-lite';
import RoomInspectionView from '../Views/RoomInspectionView.tsx';

/**
 * RoomInspectionController - Controller for room inspection workflow
 * Handles room inspection after checkout, consumption tracking, and damage assessment
 */
const RoomInspectionController: React.FC = observer(() => {
    return <RoomInspectionView />;
});

export default RoomInspectionController;