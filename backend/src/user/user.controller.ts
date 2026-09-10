import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateTeamLeadDto } from './dto/create-team-lead.dto';
import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  // SERVICE

  constructor(private userService: UserService) {}

  // GET ALL USERS
  // GET /users

  @Get()
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getUsers(Number(page) || 1, Number(limit) || 6);
  }

  // CREATE USER
  // POST /users

  @Post()
  createUser(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.userService.createUser(createUserDto);
  }

  // GET USER BY EMAIL
  // GET /users/by-email?email=abc@gmail.com

  @Get('by-email')
  getUserByEmail(
    @Query('email')
    email: string,
  ) {
    return this.userService.getUserByEmail(email);
  }

  // CREATE TEAM LEAD

  @Post('team-lead')
  createTeamLead(@Body() createTeamLeadDto: CreateTeamLeadDto) {
    return this.userService.createTeamLead(
      createTeamLeadDto.name,
      createTeamLeadDto.email,
      createTeamLeadDto.password,
    );
  }

  // GET USER BY ID
  // GET /users/:id

  @Get(':id')
  getUserById(
    @Param('id')
    id: string,
  ) {
    return this.userService.getUserById(Number(id));
  }

  // UPDATE USER
  // PATCH /users/:id

  @Patch(':id')
  updateUser(
    @Param('id')
    id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(Number(id), updateUserDto);
  }

  // DELETE USER
  // DELETE /users/:id

  @Delete(':id')
  deleteUser(
    @Param('id')
    id: string,
  ) {
    return this.userService.deleteUser(Number(id));
  }
}
