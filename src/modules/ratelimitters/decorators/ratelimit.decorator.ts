import { SetMetadata } from '@nestjs/common';
import { RuleNameType } from '../types/rulename.type';

export const RATE_LIMIT_RULE = 'rate_limit_rule';
export const RateLimit = (rule: RuleNameType) => SetMetadata(RATE_LIMIT_RULE, rule);