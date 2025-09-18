import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import { CreateDocumentDto } from './dtos/create-document.dto';
import { Document } from './entities/document.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
  ) {
    const nationalId = parseInt(file.originalname.split(' ')[0], 10).toString();
    const user = await this.userRepository.findOne({
      where: { cc: nationalId },
    });
    if (!user) {
      throw new NotFoundException(`User with cc ${nationalId} not found`);
    }
    const payload = {
      ...createDocumentDto,
      data: file.buffer,
      user: user,
    };
    const document = this.documentRepository.create(payload);
    if (!document) {
      throw new BadRequestException('Document could not be created');
    }
    return this.documentRepository.save(document);
  }

  async findAll() {
    try {
      return this.documentRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async remove(id: string) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with email ${id} not found`);
    }
    return await this.documentRepository.delete(id);
  }

  async sendDocumentById(documentId: string, to: string) {
    const document = await this.findOne(documentId);
    return this.sendEmail(document, 'm.cuastumal@icnsas.com', to);
  }

  async downloadDocumentById(id: string) {
    const document = await this.findOne(id);
    const data = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document.mount}/${document.year}-${document.user.cc}"`,
      'Content-Length': document.data.length,
    };
    return { document, data };
  }

  async uploadDocuments(
    files: Express.Multer.File[],
    createDocumentDto: CreateDocumentDto,
  ) {
    const ccs = files.map((file) =>
      parseInt(file.originalname.split(' ')[0], 10).toString(),
    );
    const users = await this.userRepository.find({
      where: { cc: In(ccs) },
    });
    const ccFoundSet = new Set(users.map((u) => u.cc));
    const data = ccs.map((cc) => ({
      cc,
      found: ccFoundSet.has(cc),
    }));
    if (data.some((d) => d.found === false)) {
      throw new BadRequestException({
        created: false,
        message: 'Some users were not found in the system',
        notFoundUsers: data.filter((d) => !d.found).map((d) => d.cc),
      });
    }
    for (const file of files) {
      await this.create(file, createDocumentDto);
    }
    return {
      created: true,
      message: 'All documents were successfully created',
      notFoundUsers: [],
    };
  }

  async downloadMyDocument(id: string, createDocumentDto: CreateDocumentDto) {
    const document = await this.findDocumentByUser(id, createDocumentDto);
    const data = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document.mount}/${document.year}-${document.user.cc}"`,
      'Content-Length': document.data.length,
    };
    return { document, data };
  }

  async sendMyDocument(
    userId: string,
    email: string,
    createDocumentDto: CreateDocumentDto,
  ) {
    const document = await this.findDocumentByUser(userId, createDocumentDto);
    return this.sendEmail(document, 'm.cuastumal@icnsas.com', email);
  }

  private async findDocumentByUser(
    userId: string,
    createDocumentDto: CreateDocumentDto,
  ) {
    const document = await this.documentRepository.findOne({
      where: {
        user: { id: userId },
        mount: createDocumentDto.mount,
        year: createDocumentDto.year,
      },
      relations: ['user'],
    });
    if (!document) {
      throw new NotFoundException('Document Not found');
    }
    return document;
  }

  private async sendEmail(
    document: Document,
    senderEmail: string,
    recipientEmail: string,
  ) {
    try {
      const rta: unknown = await this.mailerService.sendMail({
        from: senderEmail,
        to: recipientEmail,
        subject: `Desprendible de nomina ${document.mount}/${document.year}`,
        text: `Please find the document attached`,
        attachments: [
          {
            filename: `${document.user.cc} ${document.user.name}.pdf`,
            content: Buffer.from(document.data.buffer),
            contentType: 'application/pdf',
          },
        ],
      });
      return rta;
    } catch (error) {
      throw new NotFoundException(
        `Error sending email to ${recipientEmail} - Error:${error}`,
      );
    }
  }
}
