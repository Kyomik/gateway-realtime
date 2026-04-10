import { Entity } from "typeorm";
import { PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { JenisDeviceEntity } from "./jenis_device.entity";

@Entity('product')
export class ProductEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 15 })
    nama_product: string;

    @OneToMany(() => JenisDeviceEntity, (j) => j.product)
    jenisDevice: JenisDeviceEntity[];
}