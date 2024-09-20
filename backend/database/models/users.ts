import { Entity, PrimaryColumn, Column, Index } from "typeorm";

@Entity() // Декоратор для обозначения сущности
@Index("chatID_index", ["chatID"]) // Создание индекса на поле chatID
export class Users {
  @PrimaryColumn({ type: "bigint" })
  chatID: number; // Первичный ключ и индекс

  @Column({ type: "varchar", length: 255 })
  email: string; // Поле email пользователя

  @Column({ type: "varchar", length: 255 })
  username: string; // Поле для имени пользователя

  @Column({ type: "int", default: 0 })
  stage_9_score: number; // Поле для stage_9_score

  @Column({ type: "varchar", length: 255 })
  stage: string; // Текущий этап пользователя
}
