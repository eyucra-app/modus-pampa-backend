import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Adaptador personalizado para configurar Socket.IO correctamente
export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const cors: CorsOptions = {
      origin: '*', // Permite conexiones desde cualquier origen. ¡Ajústalo en producción por seguridad!
      methods: ['GET', 'POST'],
      credentials: true,
    };

    // Sobrescribimos las opciones de CORS
    options.cors = cors;
    
    // Esta opción a veces es necesaria para la compatibilidad con proxies inversos.
    options.allowEIO3 = true; 

    const server = super.createIOServer(port, options);
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS para las peticiones HTTP normales.
  // Es bueno tenerlo aquí también por consistencia.
  app.enableCors({
    origin: '*',
  });

  // Usamos nuestro adaptador personalizado para los WebSockets.
  // Esta es la parte más importante de la solución.
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  // El servidor escuchará en el puerto que Render le asigne, o en el 3000 para desarrollo local.
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();