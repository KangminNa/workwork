import { bootstrap } from './app';

bootstrap().catch((error) => {
  console.error('❌ Failed to bootstrap the application:', error);
  process.exit(1);
});
