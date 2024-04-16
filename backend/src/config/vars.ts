import 'dotenv/config';

import Joi from 'joi';

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
		PORT: Joi.number().default(3000),
		MONGODB_URL: Joi.string().required().description('Mongo DB url'),
		CLOUDINARY_URL: Joi.string().required().description('Cloudinary URL'),
		IP: Joi.string().required().description('IP Info Api Key'),
		JWT_SECRET: Joi.string().required().description('JWT Secret key'),
		REDIS_URL: Joi.string().required().description('Redis URL'),
		EXTENSION_SECRET: Joi.string().required().description('Extension Secret Key'),
		SYNC_SECRET: Joi.string().required().description('Sync Secret Key')
	})
	.unknown();

const {value: envVars, error} = envVarsSchema
	.prefs({
		errors: {
			label: 'key'
		}
	})
	.validate(process.env);
if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const config = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	mongoose: {
		url: envVars.MONGODB_URL + ('SocialStalker' + envVars.NODE_ENV === 'development' ? ':test' : '')
	},
	jwt: {
		secret: envVars.JWT_SECRET
	},
	redis: {
		url: envVars.REDIS_URL
	},
	cloudinary: {
		url: envVars.CLOUDINARY_URL
	},
	ipinfo: {
		token: envVars.IP
	},
	extension: {
		secret: envVars.EXTENSION_SECRET,
		sync: envVars.SYNC_SECRET
	}
};

export default config;
