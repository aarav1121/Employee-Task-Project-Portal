import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  // REPOSITORY

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // GET ALL USERS

  async getUsers(page: number = 1, limit: number = 6) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      order: {
        id: 'ASC',
      },
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // CREATE USER

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, department, password } = createUserDto;

    // CHECK EMAIL

    const existingUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // CHECK NAME

    const existingName = await this.userRepository.findOne({
      where: {
        name,
      },
    });

    if (existingName) {
      throw new BadRequestException('Name already exists');
    }

    // HASH PASSWORD

    const passwordHash = await bcrypt.hash(password, 10);

    // CREATE USER ENTITY

    const user = this.userRepository.create({
      name,
      email,
      department,
      passwordHash,
    });

    // SAVE TO MYSQL

    const savedUser = await this.userRepository.save(user);

    // RETURN CREATED USER

    return {
      message: 'User created successfully',

      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        department: savedUser.department,
        role: savedUser.role,
        authProvider: savedUser.authProvider,
      },
    };
  }

  // CREATE TEAM LEAD

  async createTeamLead(name: string, email: string, password: string) {
    // CHECK EMAIL

    const existingUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // CHECK NAME

    const existingName = await this.userRepository.findOne({
      where: {
        name,
      },
    });

    if (existingName) {
      throw new BadRequestException('Name already exists');
    }

    // HASH PASSWORD

    const passwordHash = await bcrypt.hash(password, 10);

    // CREATE TEAM LEAD

    const user = this.userRepository.create({
      name,
      email,
      department: 'Management',
      passwordHash,
      role: 'Team Lead',
      authProvider: 'local',
    });

    // SAVE TO MYSQL

    const savedUser = await this.userRepository.save(user);

    // RETURN SAFE USER DATA

    return {
      message: 'Team Lead created successfully',

      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        department: savedUser.department,
        role: savedUser.role,
        authProvider: savedUser.authProvider,
      },
    };
  }

  // GET USER BY EMAIL

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // GET USER BY GOOGLE ID

  async getUserByGoogleId(googleId: string) {
    return this.userRepository.findOne({
      where: {
        googleId,
      },
    });
  }

  // LINK GOOGLE ACCOUNT

  async linkGoogleAccount(id: number, googleId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.googleId = googleId;
    user.authProvider = 'google';

    return this.userRepository.save(user);
  }

  // GET USER BY ID

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // UPDATE USER

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // FIND USER

    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // CHECK EMAIL

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email,
        },
      });

      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    // CHECK NAME

    if (updateUserDto.name && updateUserDto.name !== user.name) {
      const existingName = await this.userRepository.findOne({
        where: {
          name: updateUserDto.name,
        },
      });

      if (existingName) {
        throw new BadRequestException('Name already exists');
      }
    }

    // UPDATE USER

    Object.assign(user, updateUserDto);

    // SAVE TO MYSQL

    const updatedUser = await this.userRepository.save(user);

    // RETURN UPDATED USER

    return {
      message: 'User updated successfully',

      user: updatedUser,
    };
  }

  // DELETE USER

  async deleteUser(id: number) {
    // FIND USER

    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // DELETE FROM MYSQL

    await this.userRepository.delete(id);

    // RETURN DELETED USER

    return {
      message: 'User deleted successfully',

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    };
  }
}
