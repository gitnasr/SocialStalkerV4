import {ApiError, errorConverter, errorHandler} from '@/middlewares';
import {config, handlers, logger} from '@/config';
import express, {Express} from 'express';

import ExpressMongoSanitize from 'express-mongo-sanitize';
import {v2 as cloudinary} from 'cloudinary';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import os from 'os';
import requestIp from 'request-ip';
import routes from '@/routes';

class App {
	public app: Express;
	constructor() {
		this.app = express();
		this.CloudinaryConfig();
		this.initializeMiddlewares();
		this.initializeErrorHandling();
		this.initializeControllers();
		this.start();
	}
	private CloudinaryConfig() {
		cloudinary.config(config.cloudinary.url);
	}
	private initializeMiddlewares() {
		this.app.use(helmet());
		this.app.use(cors());
		this.app.use(express.json({limit: '50mb'}));
		this.app.use(
			express.urlencoded({
				extended: false
			})
		);
		this.app.use(ExpressMongoSanitize());
		this.app.use(compression());
		this.IpInfoMiddleware();
	}
	private IpInfoMiddleware() {
		this.app.use(requestIp.mw())

	}
	private initializeErrorHandling() {
		this.app.use(handlers.successHandler);
		this.app.use(handlers.errorHandler);
	}
	private initializeControllers() {
		this.app.use('/api', routes);
		this.app.use((req, res, next) => {
			next(new ApiError(404, 'Not found'));
		});
		this.app.use(errorConverter);
		this.app.use(errorHandler);
	}
	private async connectToTheDatabase() {
		try {
			const connection = await mongoose.connect(config.mongoose.url);
			if (connection) {
				logger.info('Database connected');
			}
		} catch (error) {
			logger.error('Database connection failed');
			logger.error(error);
			process.exit(1);
		}
	}

	private async start() {
		await this.connectToTheDatabase();

		this.app.listen(config.port, () => {
			const networkInterfaces = os.networkInterfaces();
			const ipAddress = networkInterfaces['eth0'] ? networkInterfaces['eth0'][0].address : 'localhost';
			logger.info(`Server started at http://${ipAddress}:${config.port}`);
		});
	}
}

export default new App();
