import { v2 as cloudinary } from 'cloudinary';
import appConfig from './config.ts';
const config = () => {
    cloudinary.config({
        cloud_name: appConfig.CLOUDINARY_CLOUD_NAME,
        api_key: appConfig.CLOUDINARY_API_KEY,
        api_secret: appConfig.CLOUDINARY_SECRET
    });
};
const sign = () => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { api_secret, cloud_name, api_key } = cloudinary.config();

    const signature = cloudinary.utils.api_sign_request(
        { timestamp },
        api_secret!
    );

    return { timestamp, signature, cloudName: cloud_name, apiKey: api_key };
};
export default { config, sign };