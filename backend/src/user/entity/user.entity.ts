import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  department!: string;

  @Column()
  passwordHash!: string;

  @Column({
    default: 'Employee',
  })
  role!: string;

  @Column({
    default: 'local',
  })
  authProvider!: string;

  @Column({
    nullable: true,
  })
  googleId?: string;

  tasks!: string;
}
