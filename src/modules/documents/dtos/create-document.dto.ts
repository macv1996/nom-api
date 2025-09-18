import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  mount: string;

  @IsString()
  @IsNotEmpty()
  year: string;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
