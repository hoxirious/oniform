import React from 'react';
import { Link } from '../models/link.ts';
import GroupComponent from "./GroupComponent.tsx";

interface LinkComponentProps {
  link: Link;
}

class LinkComponent extends React.Component<LinkComponentProps> {
  render() {
    const { link } = this.props;

    return (
      <div>
          <GroupComponent group={link.right} />
      </div>
    );
  }
}

export default LinkComponent;