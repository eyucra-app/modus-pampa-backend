import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

// Adaptador de WebSocket robusto para producción en Render/Heroku etc.
export class ProductionSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      // Esta es la configuración clave:
      // Le decimos a Socket.IO que el servidor está detrás de un proxy
      // y que debe aceptar una conexión WebSocket directa.
      cors: {
        origin: '*', // Permite cualquier origen (seguro para apps móviles)
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Forzamos el uso exclusivo de WebSockets, que es más estable
      // en entornos de proxy que el "long-polling".
      transports: ['websocket'], 
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usamos nuestro nuevo adaptador de producción
  app.useWebSocketAdapter(new ProductionSocketIoAdapter(app));
  
  // Habilitamos CORS para las peticiones HTTP normales
  app.enableCors({ origin: '*' });

  // Escuchamos en el puerto de Render y en TODAS las interfaces de red (0.0.0.0)
  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  console.log(`✅ Application is running on: ${await app.getUrl()}`);
  console.log(`✅ WebSocket server is configured for production.`);
}
bootstrap();