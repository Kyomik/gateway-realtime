import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';

function flattenErrors(
  errors: ValidationError[],
  parentPath = '',
): { property: string; constraints: Record<string, string> }[] {
  const result: { property: string; constraints: Record<string, string> }[] = [];

  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;

    if (err.constraints) {
      result.push({ property: path, constraints: err.constraints });
    }

    if (err.children && err.children.length > 0) {
      result.push(...flattenErrors(err.children, path));
    }
  }

  return result;
}

export async function validateDtoSafe<T extends object>(
  raw: unknown,
  dtoClass: ClassConstructor<T>,
  options?: ValidatorOptions,
): Promise<{ valid: boolean; instance?: T; errors?: any }> {
  const instance = plainToInstance(dtoClass, raw);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    ...options,
  });

  if (errors.length > 0) {
    return { valid: false, errors: flattenErrors(errors) };
  }

  return { valid: true, instance };
}