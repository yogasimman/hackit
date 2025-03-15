import React, { useEffect, useState } from 'react';
import { getAllPaths } from '../api';

const PathSelection = () => {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    getAllPaths().then((response) => setPaths(response.data));
  }, []);

  return (
    <div>
      <h2>Select a Path</h2>
      <ul>
        {paths.map((path) => (
          <li key={path.id}>{path.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PathSelection;