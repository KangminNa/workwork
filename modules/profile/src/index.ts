import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function profileFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing profile flow for', ctx.requestId);
  return null;
}
