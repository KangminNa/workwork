import type { HandlerContext } from '@workwork/core-runtime';
import type { TimeBlockDTO } from '@workwork/shared';

export async function telemetryFlow(ctx: HandlerContext): Promise<TimeBlockDTO | null> {
  console.log('Executing telemetry flow for', ctx.requestId);
  return null;
}
