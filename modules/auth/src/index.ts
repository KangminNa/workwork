import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function authFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing auth flow for', ctx.requestId);
  return null;
}
