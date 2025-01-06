import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [ip, setIp] = useState("localhost");
  const [port, setPort] = useState("");
  const [logs, setLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [socket, setSocket] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  const handleIpChange = (e) => {
    setIp(e.target.value);
  };

  const handlePortChange = (e) => {
    setPort(e.target.value);
  };

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const connectToServer = () => {
    const portNumber = parseInt(port, 10);

    if (!ip) {
      addLog("Invalid IP. Please enter a valid IP address.");
      return;
    }

    if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
      addLog("Invalid port. Please enter a valid numeric port.");
      return;
    }

    const ws = new WebSocket(`ws://${ip}:${portNumber}`);

    ws.onopen = () => {
      addLog(`Connected to WebSocket server on ws://${ip}:${portNumber}`);
      setIsListening(true);
    };

    ws.onmessage = (event) => {
      addLog(`Received: ${event.data}`);
    };

    ws.onerror = (error) => {
      addLog(`Connection error: ${error.message}`);
    };

    ws.onclose = () => {
      addLog("Connection closed.");
      setIsListening(false);
    };

    setSocket(ws);
  };

  const saveLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const stopListening = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const toggleAutoScroll = () => {
    setAutoScroll((prev) => !prev);
  };

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <div
      style={{
        padding: "10%",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center" }}>WebSocket Client</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="ip">IP Address:</label>
          <input
            id="ip"
            type="text"
            value={ip}
            onChange={handleIpChange}
            disabled={isListening}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="port">Port:</label>
          <input
            id="port"
            type="text"
            value={port}
            onChange={handlePortChange}
            disabled={isListening}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={connectToServer}
            disabled={isListening}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "white",
              cursor: "pointer",
            }}
          >
            Start Listening
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#f44336",
              color: "white",
              cursor: "pointer",
            }}
          >
            Stop Listening
          </button>
        </div>
        <button
          onClick={saveLogs}
          disabled={logs.length === 0}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#008CBA",
            color: "white",
            cursor: "pointer",
          }}
        >
          Save Logs
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label>Auto Scroll:</label>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={toggleAutoScroll}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
      <div style={{ flexGrow: 1, marginTop: "20px" }}>
        <h2 style={{ textAlign: "center" }}>Logs:</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "100%",
            overflowY: "scroll",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          <div ref={logsEndRef}></div>
        </div>
      </div>
    </div>
  );
}
