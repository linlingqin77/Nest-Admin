import { IsString, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'src/common/validators/password.validator';

/**
 * 重置密码 DTO
 */
export class ResetPwdDto {
  @ApiProperty({ required: true, description: '用户ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ required: true, description: '新密码' })
  @IsString()
  @IsStrongPassword()
  @Length(5, 20)
  password: string;
}
