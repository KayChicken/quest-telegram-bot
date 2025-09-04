import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('reminder')
@Index("chatID_index_reminder", ["chatID"])
export class Reminder {
  @PrimaryGeneratedColumn({ type: "int" })
  declare id: string;

  @Column({ type: "bigint" })
  declare chatID: number;

  @Column("text")
  declare message: string;

  @Column("timestamp")
  declare sendAt: Date;

  @Column("jsonb", { nullable: true })
  declare replyMarkup?: object;

  @Column("boolean", { default: false })
  declare isSent: boolean;
}
