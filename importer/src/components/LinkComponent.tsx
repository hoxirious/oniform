import React from 'react';
import { Link } from '../models/link.ts';
import GroupComponent from "./GroupComponent.tsx";
import StationComponent from "./StationComponent.tsx";

interface LinkComponentProps {
  link: Link;
}

class LinkComponent extends React.Component<LinkComponentProps> {
  render() {
    const { link } = this.props;

    return (
      <div>
        {link.rightType === "Group" &&
          <GroupComponent group={link.right as Group} />
        }
        {
            link.rightType === "Station" &&
            <StationComponent station={link.right as Station} />
        }
      </div>
    );
  }
}

export default LinkComponent;