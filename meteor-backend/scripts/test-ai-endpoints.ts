import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AiController } from '../src/ai/ai.controller';
import { AiService } from '../src/ai/ai.service';
import geminiConfig from '../src/config/gemini.config';

const request = require('supertest');

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [geminiConfig] })],
  controllers: [AiController],
  providers: [AiService],
})
class TestAiModule {}

async function main() {
  const app = await NestFactory.create(TestAiModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.init();

  const generateRes = await request(app.getHttpServer())
    .post('/api/v1/ai/generate-task')
    .send({
      prompt: 'Create a simple testing task for a landing page',
      category: 'testing',
    });

  const verifyRes = await request(app.getHttpServer())
    .post('/api/v1/ai/verify-task')
    .send({
      taskTitle: 'Landing Page QA',
      taskDescription: 'Test the landing page for usability issues.',
      taskRequirements: 'Find at least 3 bugs and provide evidence.',
      submissionContent: 'I found 3 issues and attached screenshots.',
      submissionProof: 'https://example.com/proof',
    });

  console.log(JSON.stringify({
    generateStatus: generateRes.status,
    generateBody: generateRes.body,
    verifyStatus: verifyRes.status,
    verifyBody: verifyRes.body,
  }, null, 2));

  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
