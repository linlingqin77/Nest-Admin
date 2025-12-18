import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '上传文件' })
  file: any;

  @ApiProperty({ required: false, description: '文件夹ID', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  folderId?: number;
}
export class uploadIdDto {
  @ApiProperty({ type: 'string', description: '上传标识ID' })
  uploadId: string;
}
export class ChunkFileDto {
  @ApiProperty({ type: 'string', description: '分片索引' })
  index: number;
  @ApiProperty({ type: 'string', description: '总分片数' })
  totalChunks: number;
  @ApiProperty({ type: 'string', description: '上传标识ID' })
  uploadId: string;
  @ApiProperty({ type: 'string', description: '文件名称' })
  fileName: string;

  @ApiProperty({ required: false, description: '文件夹ID', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  folderId?: number;
}

export class ChunkMergeFileDto {
  @ApiProperty({ type: 'string', description: '上传标识ID' })
  uploadId: string;
  @ApiProperty({ type: 'string', description: '文件名称' })
  fileName: string;

  @ApiProperty({ required: false, description: '文件夹ID', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  folderId?: number;
}
