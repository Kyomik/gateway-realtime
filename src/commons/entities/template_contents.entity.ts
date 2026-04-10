import { Entity } from "typeorm";
import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { NotificationTemplateEntity } from "./notification_templates.entity";

@Entity('template_contents')
export class TemplateContentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  template_id: number;

  @Column()
  channel: string; // 'email' | 'whatsapp'

  @Column()
  key_name: string; // 'subject' | 'body' | 'footer'

  @Column('text')
  content_value: string; // "Halo {{nama}}, ..."

  @Column({ default: 0 })
  sort_order: number;

  @ManyToOne(() => NotificationTemplateEntity, (template) => template.contents)
  @JoinColumn({ name: 'template_id' })
  template: NotificationTemplateEntity;
}