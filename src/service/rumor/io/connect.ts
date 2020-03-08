
import SocketIo from 'socket.io-client';

export interface ConnectResponse {
  socketClient: SocketIOClient.Socket,
  username: string
}

export function connectSocket(token: string): Promise<ConnectResponse> {
  return new Promise((resolve, reject) => {
    const socket = SocketIo(process.env.VUE_APP_SERVICE_ENDPOINT);

    socket.on('connect', () => {
      socket.emit('authenticate', token, (username: string) => {
        resolve({
          socketClient: socket,
          username
        });
      });
    });

    socket.on('connect_error', () => {
      console.warn('Error connecting to service.');
      socket.close();
      reject("Error connecting to service.");
    });

    socket.on('connect_timeout', () => {
      console.warn('Connection timed out.');
      reject("Connection timed out.");
    });
  });
}