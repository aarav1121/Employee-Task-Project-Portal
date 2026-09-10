import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name is not valid' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Email is not valid' })
  email!: string;

  @IsString({ message: 'Department is not valid' })
  @IsNotEmpty({ message: 'Department is required' })
  department!: string;

  @IsString({ message: 'Password is not valid' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;
}
