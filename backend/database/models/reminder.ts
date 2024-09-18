import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index("chatID_index_reminder", ["chatID"])
export class Reminder {
  @PrimaryGeneratedColumn({ type: 'int' })
  declare id: string;

  @Column({ type: "int" })
  chatID: number;

  @Column('text')
  message: string;

  @Column('timestamp')
  sendAt: Date;

  @Column('jsonb', { nullable: true })
  replyMarkup?: object;

  @Column('boolean', { default: false })
  isSent: boolean;
}