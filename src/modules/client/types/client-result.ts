import { ClientEntity } from "src/commons/entities/client.entity";

export type ExactResult = {
  client?: ClientEntity;
  secretValid: boolean;
  roleValid: boolean;
};
