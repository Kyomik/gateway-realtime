import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { RefreshTokenService } from './services/refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RateLimit } from '../ratelimitters/decorators/ratelimit.decorator';
import { RestRateLimitGuard } from '../ratelimitters/guards/rest-ratelimit.guard';

@Controller('auth')
@UseGuards(RestRateLimitGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('token')
  @RateLimit('preConnect')
  async token(@Body() dto: GenerateTokenDto) {
    const { accessToken, refreshToken, accessTokenExpiry } = await this.authService.login(dto);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiry, // 15 menit
    };
  }

  @Post('refresh')
  @RateLimit('postConnect')
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refresh(dto.refreshToken);
    return {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expires_in: 900,
    };
  }

  @Post('logout')
  @RateLimit('postConnect')
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.refreshTokenService.revoke(refreshToken);
    return { message: 'Logged out' };
  }
}