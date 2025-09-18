import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), UsersModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [TypeOrmModule],
})
export class DocumentsModule {}
