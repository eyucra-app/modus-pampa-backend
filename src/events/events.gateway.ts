// src/events/events.gateway.ts
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, deberías restringir esto a tu dominio de Flutter
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  // Este método se puede llamar desde otros servicios para emitir eventos
  public emitChange(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Notificación emitida -> Evento: ${event}, Data: ${JSON.stringify(data)}`);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Inicializado');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }
}