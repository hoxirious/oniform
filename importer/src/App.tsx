import { useState, useEffect } from 'react';
import './App.css';
import GroupComponent from './components/GroupComponent';
import sampleData from './data/sample.json';
import { Group } from './models/group';

function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // @ts-ignore
        const parsedData: Group[] = sampleData.groups;
      setGroups(parsedData);
    } catch (err) {
      setError('Failed to load group data');
      console.error(err);
    }
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <h1>Importer</h1>
      {groups.map(group => (
        <GroupComponent key={group.id} group={group} />
      ))}
    </>
  );
}

export default App;