import React, { useState } from 'react';
import { Station } from '../models/station.ts';
import TerminalComponent from './TerminalComponent.tsx';

interface StationComponentProps {
  station: Station;
}

const StationComponent: React.FC<StationComponentProps> = ({ station }) => {
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);

  const handleTerminalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTerminalId(event.target.value);
  };

  return (
    <div>
      <h3>{station.label}</h3>
      <p>{station.value}</p>
      <select onChange={handleTerminalChange}>
        <option value="">No selection</option>
        {station.terminals.map(terminal => (
          <option key={terminal.id} value={terminal.id}>
            {terminal.label} - {terminal.value}
          </option>
        ))}
      </select>
      {selectedTerminalId && (
        <TerminalComponent terminal={station.terminals.find(t => t.id === selectedTerminalId)!} />
      )}
    </div>
  );
};

export default StationComponent;