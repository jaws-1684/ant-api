import app from './app.ts';
import config from './utils/config.ts';
import logger from './utils/logger.ts';

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
});