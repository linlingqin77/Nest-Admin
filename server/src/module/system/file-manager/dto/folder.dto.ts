import { IsString, IsNumber, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ required: false, description: '父文件夹ID', default: 0 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ required: true, description: '文件夹名称' })
  @IsString()
  @Length(1, 100)
  folderName: string;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @IsNumber()
  orderNum?: number;

  @ApiProperty({ required: false, description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateFolderDto {
  @ApiProperty({ required: true, description: '文件夹ID' })
  @IsNumber()
  folderId: number;

  @ApiProperty({ required: false, description: '文件夹名称' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  folderName?: string;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @IsNumber()
  orderNum?: number;

  @ApiProperty({ required: false, description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class ListFolderDto {
  @ApiProperty({ required: false, description: '父文件夹ID' })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ required: false, description: '文件夹名称' })
  @IsOptional()
  @IsString()
  folderName?: string;
}
