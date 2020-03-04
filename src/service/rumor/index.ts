import { RumorService } from './interface';

import { RumorServiceLocal } from "./local";
import { RumorServiceIo } from "./io";



let serviceInterface: RumorService;

/*
async function createLocalInterface(): Promise<RumorService> {
  serviceInterface = new RumorServiceLocal();
  return serviceInterface;
}
*/

/*
export function createServiceInterface(token: string): Promise<RumorService> {
  return new Promise<RumorService>((resolve, reject) => {
    const socket = SocketIo(process.env.VUE_APP_SERVICE_ENDPOINT);

    socket.on('connect', () => {
      socket.emit('authenticate', token, () => {
        serviceInterface = new RumorServiceIo(socket);
        resolve(serviceInterface);
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
*/

/* Since I'm putting the local mode on hold for awhile, just create
an IO service interface. */

serviceInterface = new RumorServiceIo();


export function getServiceInterface(): RumorService {
  if (!serviceInterface) {
    console.error('Attempting to get service interface before it is set.');
    throw "Attempting to get service interface before it is set.";
  }

  return serviceInterface;
}