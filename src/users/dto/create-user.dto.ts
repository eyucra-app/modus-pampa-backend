import { IsString, IsNotEmpty, IsUUID, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail() // Validación para formato de email
  @IsNotEmpty()
  email: string; // Nuevo campo para el correo

  @IsString()
  @IsNotEmpty()
  role: string;
}