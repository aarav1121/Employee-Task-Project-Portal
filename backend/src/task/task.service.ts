import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Activity } from './entity/activity.entity';

import { User } from '../user/entity/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  // GET PAGINATED TASKS
  async findAll(page: number = 1, limit: number = 6) {
    const skip = (page - 1) * limit;

    const [tasks, total] = await this.taskRepository.findAndCount({
      relations: {
        assignedEmployee: true,
      },

      order: {
        createdAt: 'DESC',
      },

      skip,
      take: limit,
    });

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET DASHBOARD METRICS
  async getDashboardMetrics() {
    const tasks = await this.taskRepository.find();

    const totalAssignedTasks = tasks.length;

    const pendingAcceptanceTasks = tasks.filter(
      (task) => task.status === 'Pending Acceptance',
    ).length;

    const acceptedTasks = tasks.filter(
      (task) => task.status === 'Accepted',
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === 'In Progress',
    ).length;

    const underReviewTasks = tasks.filter(
      (task) => task.status === 'Under Review',
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === 'Completed',
    ).length;

    const respondedTasks = totalAssignedTasks - pendingAcceptanceTasks;

    const acceptanceRate =
      totalAssignedTasks === 0
        ? 0
        : Math.round((respondedTasks / totalAssignedTasks) * 100);

    const activeTasksCount = inProgressTasks;

    const maximumCapacity = 20;

    const teamCapacity = Math.min(
      Math.round((activeTasksCount / maximumCapacity) * 100),
      100,
    );

    const remainingCapacity = Math.max(maximumCapacity - activeTasksCount, 0);

    const criticalTasks = tasks.filter(
      (task) => task.priority === 'Critical',
    ).length;

    const highTasks = tasks.filter((task) => task.priority === 'High').length;

    const mediumTasks = tasks.filter(
      (task) => task.priority === 'Medium',
    ).length;

    const lowTasks = tasks.filter((task) => task.priority === 'Low').length;

    const criticalPercentage =
      totalAssignedTasks === 0
        ? 0
        : Math.round((criticalTasks / totalAssignedTasks) * 100);

    const highPercentage =
      totalAssignedTasks === 0
        ? 0
        : Math.round((highTasks / totalAssignedTasks) * 100);

    const mediumPercentage =
      totalAssignedTasks === 0
        ? 0
        : Math.round((mediumTasks / totalAssignedTasks) * 100);

    const lowPercentage =
      totalAssignedTasks === 0
        ? 0
        : Math.round((lowTasks / totalAssignedTasks) * 100);

    return {
      totalAssignedTasks,

      acceptanceRate,

      activeTasksCount,
      teamCapacity,
      remainingCapacity,

      pendingAcceptanceTasks,
      acceptedTasks,
      inProgressTasks,
      underReviewTasks,
      completedTasks,

      criticalTasks,
      highTasks,
      mediumTasks,
      lowTasks,

      criticalPercentage,
      highPercentage,
      mediumPercentage,
      lowPercentage,

      onTimeCompletion: 0,
    };
  }
  // GET RECENT ACTIVITIES
  async getRecentActivities() {
    return this.activityRepository.find({
      relations: {
        task: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 4,
    });
  }

  // GET ONE TASK
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },

      relations: {
        assignedEmployee: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // CREATE TASK
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const employee = await this.userRepository.findOne({
      where: {
        id: createTaskDto.assignedEmployeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createTaskDto.assignedEmployeeId} not found`,
      );
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      assignedEmployee: employee,
    });

    const savedTask = await this.taskRepository.save(task);

    const activity = this.activityRepository.create({
      title: 'New task assigned',
      description: `${savedTask.title} was assigned to ${employee.name}`,
      taskId: savedTask.id,
      task: savedTask,
    });

    await this.activityRepository.save(activity);

    return this.findOne(savedTask.id);
  }

  // UPDATE TASK
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },

      relations: {
        assignedEmployee: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // UPDATE EMPLOYEE
    if (updateTaskDto.assignedEmployeeId !== undefined) {
      const employee = await this.userRepository.findOne({
        where: {
          id: updateTaskDto.assignedEmployeeId,
        },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${updateTaskDto.assignedEmployeeId} not found`,
        );
      }

      task.assignedEmployee = employee;
      task.assignedEmployeeId = employee.id;
    }

    // UPDATE OTHER TASK FIELDS
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate;
    }

    if (updateTaskDto.acceptanceDeadline !== undefined) {
      task.acceptanceDeadline = updateTaskDto.acceptanceDeadline;
    }

    const savedTask = await this.taskRepository.save(task);

    return this.findOne(savedTask.id);
  }

  // DELETE TASK
  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.delete(id);
  }
}
