import { ValidateNested } from 'class-validator';
import { IsBoolean } from 'class-validator';

export class SuccessResponseDto<T> {
  @IsBoolean()
  readonly isSuccess = true as const;

  @ValidateNested()
  data: T;
}
