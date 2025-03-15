import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PathSelector = () => {
    const [paths, setPaths] = useState([]);
    const [selectedPath, setSelectedPath] = useState(null);

    useEffect(() => {
        axios.get('/paths').then(response => setPaths(response.data));
    }, []);

    return (
        <div>
            <h2>Select a Path</h2>
            <ul>
                {paths.map(path => (
                    <li key={path.id} onClick={() => setSelectedPath(path.id)}>
                        {path.name}
                    </li>
                ))}
            </ul>
            {selectedPath && <NodeList pathId={selectedPath} />}
        </div>
    );
};

const NodeList = ({ pathId }) => {
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        axios.get(`/nodes/${pathId}`).then(response => setNodes(response.data));
    }, [pathId]);

    return (
        <div>
            <h3>Nodes</h3>
            <ul>
                {nodes.map(node => (
                    <li key={node.id}>
                        <NodeDetail node={node} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const NodeDetail = ({ node }) => {
    const [completed, setCompleted] = useState(false);

    const handleComplete = () => {
        axios.post('/progress', { userId: 1, nodeId: node.id }).then(() => setCompleted(true));
    };

    return (
        <div>
            <h4>{node.title}</h4>
            <p>{node.description}</p>
            {!completed && <button onClick={handleComplete}>Mark as Completed</button>}
            {completed && <p>Completed!</p>}
        </div>
    );
};

const ProgressTracker = () => {
    const [progress, setProgress] = useState({ progress: [], totalXP: 0 });

    useEffect(() => {
        axios.get('/user/1/progress').then(response => setProgress(response.data));
    }, []);

    return (
        <div>
            <h2>Your Progress</h2>
            <p>Total XP: {progress.totalXP}</p>
            <ul>
                {progress.progress.map(p => (
                    <li key={p.id}>Node {p.node_id} completed on {p.completed_at}</li>
                ))}
            </ul>
        </div>
    );
};

const App = () => (
    <div>
        <PathSelector />
        <ProgressTracker />
    </div>
);

export default App;