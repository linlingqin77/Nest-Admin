import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // In newer versions, req is already the request object, not ExecutionContext
    const user = req.user;
    if (user && user.userId) return `user-${user.userId}`;

    const ip = req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    return `ip-${ip}`;
  }

  // ThrottlerGuard in newer versions expects an async method with this signature
  protected async throwThrottlingException(context: ExecutionContext, _throttlerLimitDetail?: any): Promise<void> {
    throw new ThrottlerException('请求过于频繁，请稍后再试');
  }
}
