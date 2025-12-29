import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  });

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public' });

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('API BiblioSphere')
    .setDescription('Documentation API NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Démarrage serveur en IPv4 (évite conflit avec Next.js sur 3000)
  await app.listen(3001, '127.0.0.1');

  const url = await app.getUrl();
  console.log(`\n🚀 Application: ${url}`);
  console.log(`📘 Swagger: ${url}/api\n`);
}

bootstrap();
