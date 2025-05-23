import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });

let document = "";

//Cada vez que un cliente se conecta, se dispara el callback
wss.on("connection", (ws) => {
  //ws es el objeto websocket que representa la conexión con el cliente
  console.log("New client connected");

  //Enviamos el documento actual al nuevo cliente
  ws.send(JSON.stringify({ type: "init", data: document }));

  //Cuando el cliente envía un mensaje, se dispara el callback
  ws.on("message", (message) => {
    // message es el mensaje enviado por el cliente

    try {
      const parsedMessage = JSON.parse(message);

      //Si el mensaje es de tipo "update", actualizamos el documento
      if (parsedMessage.type === "update") {
        document = parsedMessage.data;
        //Enviamos el mensaje a todos los clientes conectados

        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: "update", data: document }));
          }
        });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  //Cuando el cliente se desconecta, se dispara el callback
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
