import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  // Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Express, Response } from 'express';

import { DocumentsService } from './documents.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentService: DocumentsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/download/me')
  async downloadMyDocument(
    @Req() req: Express.Request,
    @Body() createDocumentDto: CreateDocumentDto,
    @Res() res: Response,
  ) {
    const user = req.user as { id: string; role: string };
    const { data, document } = await this.documentService.downloadMyDocument(
      user.id,
      createDocumentDto,
    );
    res.set(data);
    res.send(document.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/send/me')
  async sendMyDocument(
    @Req() req: Express.Request,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    const user = req.user as { id: string; role: string; email: string };
    const document = await this.documentService.sendMyDocument(
      user.id,
      user.email,
      createDocumentDto,
    );
    return document;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentService.create(file, createDocumentDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.documentService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/send/:id')
  sendDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentService.sendDocumentById(id, 'm.cuastumal@icnsas.com');
  }

  @HttpCode(HttpStatus.OK)
  @Get('/download/:id')
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { data, document } =
      await this.documentService.downloadDocumentById(id);
    res.set(data);
    res.send(document.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentService.uploadDocuments(files, createDocumentDto);
  }
}
