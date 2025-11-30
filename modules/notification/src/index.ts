import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function notificationFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing notification flow for', ctx.requestId);
  return null;
}
