import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown fields, transforms types, throws on bad input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Vibe Logistics API')
    .setDescription(
      `## RBAC Permission Model

| Role | Permissions |
|---|---|
| **admin** | All permissions |
| **warehouse_manager** | warehouse:read/create/update/delete |
| **finance_manager** | finance:read/create/update/delete |
| **customer** | customer:assets:read, customer:assets:update |

**Quick start:** POST \`/auth/login\` → copy \`access_token\` → click **Authorize** above.

**Test accounts (run \`npm run seed\` first):**
- admin@test.com / password123
- warehouse@test.com / password123
- finance@test.com / password123
- customer@test.com / password123`,
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3002}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 3002}/api`);
}
void bootstrap();
