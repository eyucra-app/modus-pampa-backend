// src/events/events.module.ts
import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Global() // Hacemos el módulo global para que el gateway pueda ser inyectado en cualquier servicio
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // Exportamos el gateway para que sea accesible
})
export class EventsModule {}