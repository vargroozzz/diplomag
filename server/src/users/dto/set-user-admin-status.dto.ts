import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserAdminStatusDto {
  @ApiProperty({
    description: 'The new admin status for the user',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;
} 