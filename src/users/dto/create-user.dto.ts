import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}