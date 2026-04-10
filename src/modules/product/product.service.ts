import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProductService{
    constructor(
        // @InjectRepository()
    ){}

    getModeByProduct(){
        return Map<'helo', 'helo'>
    }
}