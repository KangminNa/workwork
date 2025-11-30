import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function calendarFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing calendar flow for', ctx.requestId);
  return null;
}
