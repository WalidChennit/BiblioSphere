import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('API BiblioSphere')
    .setDescription('Documentation API NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Démarrage serveur en IPv4
  await app.listen(3000, '127.0.0.1');

  const url = await app.getUrl();
  console.log(`\n🚀 Application: ${url}`);
  console.log(`📘 Swagger: ${url}/api\n`);
}

bootstrap();
