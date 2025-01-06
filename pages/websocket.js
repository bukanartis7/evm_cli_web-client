
import { useState, useEffect } from 'react';

export default function WebSocketPage() {
    const [ip, setIp] = useState('127.0.0.1');
    const [port, setPort] = useState('');
    const [logs, setLogs] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    const connectToServer = () => {
        if (!port || !ip) {
            alert('Please enter a valid IP and port');
            return;
        }

        const socket = new WebSocket(`ws://${ip}:${port}`);

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            setLogs(prevLogs => [...prevLogs, `Connected to ws://${ip}:${port}`]);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            console.log(`Received: ${event.data}`);
            setLogs(prevLogs => [...prevLogs, `Received: ${event.data}`]);
        };

        socket.onerror = (err) => {
            console.error(`Connection error: ${err.message}`);
            setLogs(prevLogs => [...prevLogs, `Connection error: ${err.message}`]);
            handleReconnect(socket);
        };

        socket.onclose = () => {
            console.log("Connection closed.");
            setLogs(prevLogs => [...prevLogs, 'Connection closed']);
            handleReconnect(socket);
        };

        setWs(socket);
    };

    const handleReconnect = (socket) => {
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setLogs(prevLogs => [...prevLogs, `Reconnecting... (${retryCount + 1}/${maxRetries})`]);
            setTimeout(() => {
                connectToServer();
            }, 2000);
        } else {
            setLogs(prevLogs => [...prevLogs, 'Failed to reconnect after multiple attempts']);
            alert('Failed to reconnect after multiple attempts');
        }
    };

    const saveLogs = () => {
        const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'logs.txt';
        link.click();
        setLogs([...logs, 'Logs saved!']);
    };

    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    return (
        <div className="container">
            <h1>WebSocket Client</h1>

            <div>
                <label htmlFor="ip">IP Address:</label>
                <input
                    id="ip"
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="Enter IP address"
                />
            </div>

            <div>
                <label htmlFor="port">Port:</label>
                <input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="Enter port number"
                />
            </div>

            <div>
                <button onClick={connectToServer} disabled={isConnected}>
                    {isConnected ? 'Listening...' : 'Start Listening'}
                </button>
            </div>

            <div>
                <button onClick={saveLogs}>Save Logs</button>
            </div>

            <div>
                <h3>Logs:</h3>
                <pre>{logs.join('\n')}</pre>
            </div>

            <style jsx>{\`
                .container {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    font-family: Arial, sans-serif;
                }
                label {
                    font-weight: bold;
                    margin-right: 10px;
                }
                input {
                    margin-top: 10px;
                    padding: 5px;
                    width: 100%;
                    box-sizing: border-box;
                }
                button {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    box-sizing: border-box;
                }
                button:disabled {
                    background-color: #c7c7c7;
                    cursor: not-allowed;
                }
                pre {
                    background-color: #f4f4f4;
                    padding: 10px;
                    max-height: 200px;
                    overflow-y: auto;
                    font-family: monospace;
                }
                @media (min-width: 768px) {
                    .container {
                        width: 80%;
                    }
                    button {
                        width: auto;
                    }
                }
            \`}</style>
        </div>
    );
}
