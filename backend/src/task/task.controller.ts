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

import { TaskService } from './task.service';

import { CreateTaskDto } from './dto/create-task.dto';

import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // GET /tasks?page=1&limit=6
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.taskService.findAll(Number(page) || 1, Number(limit) || 6);
  }

  // GET /tasks/dashboard
  @Get('dashboard')
  dashboard() {
    return this.taskService.getDashboardMetrics();
  }
  // GET /tasks/activity
  @Get('activity')
  getRecentActivities() {
    return this.taskService.getRecentActivities();
  }
  // GET /tasks/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  // POST /tasks
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  // PATCH /tasks/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  // DELETE /tasks/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
