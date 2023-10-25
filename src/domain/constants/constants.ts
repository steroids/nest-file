import * as dotenv from 'dotenv';

dotenv.config();

export const REMOVING_FILES_BY_CRON_IS_ENABLE = Boolean(process.env.REMOVING_FILES_BY_CRON_IS_ENABLE);
