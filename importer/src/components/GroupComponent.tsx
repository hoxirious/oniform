import React from 'react';
import { Group } from '../models/group.ts';
import StationComponent from './StationComponent.tsx';

interface GroupComponentProps {
  group: Group;
}

class GroupComponent extends React.Component<GroupComponentProps> {
  render() {
    const { group } = this.props;

    return (
      <div id={group.id}>
        <h2>{group.label}</h2>
        {group.stations.map(station => (
          <StationComponent key={station.id} station={station} />
        ))}
      </div>
    );
  }
}

export default GroupComponent;