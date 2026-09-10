import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entity/task.entity';
import { SubTask } from './entity/subtask.entity';
import { Activity } from './entity/activity.entity';
import { User } from '../user/entity/user.entity';

import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, SubTask, Activity, User])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
