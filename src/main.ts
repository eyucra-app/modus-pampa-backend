import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// El adaptador que ya teníamos está bien, lo mantenemos por si acaso.
export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const cors: CorsOptions = {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    };
    options.cors = cors;
    options.allowEIO3 = true; 
    const server = super.createIOServer(port, options);
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();