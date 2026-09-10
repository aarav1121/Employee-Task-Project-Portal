import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  assignedEmployeeId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedEmployeeId' })
  assignedEmployee!: User;

  @Column()
  priority!: string;

  @Column()
  status!: string;

  @Column()
  dueDate!: string;

  @Column()
  acceptanceDeadline!: string;

  @Column({ nullable: true })
  declineReason?: string;

  @Column({ nullable: true })
  declineComment?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
