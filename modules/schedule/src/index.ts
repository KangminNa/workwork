import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function scheduleFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing schedule flow for', ctx.requestId);
  return null;
}
