import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function labelFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing label flow for', ctx.requestId);
  return null;
}
