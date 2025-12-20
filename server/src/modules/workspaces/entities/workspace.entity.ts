import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Workspace (워크스페이스) 엔티티
 * - 팀 단위 공간
 * - 고유한 초대 코드 보유
 */
@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  ownerId: number;

  @Column({ length: 20, unique: true })
  @Index()
  inviteCode: string;

  @OneToMany(() => User, (user) => user.workspace)
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

