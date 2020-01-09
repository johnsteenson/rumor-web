import SocketIo from 'socket.io-client';


export class SocketClient {

  private socket: SocketIOClient.Socket;

  private authenticated: boolean = true; // For now, change later

  constructor() {
    this.socket = SocketIo("http://localhost:3000");

    this.socket.on('connect', () => {
      console.log('CONNECTED');
      this.emit('getMap', 1);
    });
  }

  public authenticate(token: string) {

  }

  public on(event: string, callback: Function) {
    this.socket.on(event, callback);
  }

  public emit(event: string, ...args: any[]) {
    if (!this.authenticated) {
      console.warn('Attempting to send message on unauthenticated socket');
      return;
    }
    this.socket.emit(event, ...args);
  }

}