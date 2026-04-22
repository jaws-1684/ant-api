import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.NODE_ENV == "test" ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;
export default {
    PORT: process.env.PORT || 3001,
    MONGODB_URI
};