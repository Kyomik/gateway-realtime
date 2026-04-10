import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn 
} from "typeorm";
import { ClientEntity } from "./client.entity";

@Entity('firebase_config')
export class FirebaseConfigEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'client_id', type: 'bigint', unsigned: true })
    clientId: number;

    @OneToOne(() => ClientEntity, (client) => client.firebaseConfig, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: ClientEntity;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column({ name: 'private_key', type: 'text' })
    privateKey: string;

    @Column({ name: 'client_email' })
    clientEmail: string;
}