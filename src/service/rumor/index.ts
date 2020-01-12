import { RumorService } from './interface';

import { RumorServiceLocal } from "./local";
import { RumorServiceIo } from "./io";

import SocketIo from 'socket.io-client';

let serviceInterface: RumorService;

export async function createLocalInterface(): Promise<RumorService> {
  serviceInterface = new RumorServiceLocal();
  return serviceInterface;
}

export function createServiceInterface(token: string): Promise<RumorService> {
  return new Promise<RumorService>((resolve, reject) => {
    const socket = SocketIo("http://localhost:3000");

    socket.on('connect', () => {
      console.log('CONNECTED');
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

export function getServiceInterface(): RumorService {
  if (!serviceInterface) {
    console.error('Attempting to get service interface before it is set.');
    throw "Attempting to get service interface before it is set.";
  }

  return serviceInterface;
}