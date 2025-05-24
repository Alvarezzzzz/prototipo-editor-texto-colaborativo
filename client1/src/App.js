import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);


  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:5000");
    setSocket(newSocket);


    newSocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    // Evento que se dispara cuando el cliente recibe un mensaje del servidor
    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "init") {
          setDocument(() => message.data);
        } else if (message.type === "update") {
          setDocument(message.data);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // Evento que se dispara cuando el cliente se desconecta
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Evento que se dispara cuando hay un error en la conexión
    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Limpiar el socket al desmontar el componente
    return () => {
      newSocket.close();
    };
  }, []);

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "update", data: newDocument }));
    }
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <textarea value={document} onChange={handleChange} rows="20" cols="80" />
    </div>
  );
};

export default App;
