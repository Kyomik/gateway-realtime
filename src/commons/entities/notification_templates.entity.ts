import { Entity } from "typeorm";
import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ClientEntity } from "./client.entity";
import { TemplateContentEntity } from "./template_contents.entity";

@Entity('notification_templates')
export class NotificationTemplateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClientEntity, (client) => client.notificationTemplates)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'client_id' })
  client: ClientEntity;

  @Column()
  event_name: string;

  @OneToMany(() => TemplateContentEntity, (content) => content.template)
  contents: TemplateContentEntity[];
}