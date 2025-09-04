import { Entity, PrimaryColumn, Column, Index } from "typeorm";

@Entity("users") // Декоратор для обозначения сущности
@Index("chatID_index", ["chatID"]) // Создание индекса на поле chatID
export class Users {
  @PrimaryColumn({ type: "bigint" })
  declare chatID: number; // Первичный ключ и индекс

  @Column({ type: "varchar", length: 255 })
  declare email: string; // Поле email пользователя

  @Column({ type: "varchar", length: 255 })
  declare username: string; // Поле для имени пользователя

  @Column({ type: "int", default: 0 })
  declare stage_9_score: number; // Поле для stage_9_score

  @Column({ type: "varchar", length: 255 })
  declare stage: string; // Текущий этап пользователя

  @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  declare created_at: Date;
}
