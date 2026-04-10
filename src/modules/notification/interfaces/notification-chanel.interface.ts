import { StudentDto } from "src/commons/dtos/student.dto";
import { TemplateContentEntity } from "src/commons/entities/template_contents.entity";

export interface IChannel {
  send(
    context: any, 
    recipients: StudentDto[], 
    clientId: string,
    contents: TemplateContentEntity[]
  ): Promise<void>;
}