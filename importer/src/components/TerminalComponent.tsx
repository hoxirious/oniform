import React from 'react';
import { Terminal } from '../models/terminal.ts';
import LinkComponent from './LinkComponent.tsx';

interface TerminalComponentProps {
  terminal: Terminal;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ terminal }) => {
  return (
    <div>
      {terminal.links.map(link => (
        <LinkComponent key={link.id} link={link} />
      ))}
    </div>
  );
};

export default TerminalComponent;