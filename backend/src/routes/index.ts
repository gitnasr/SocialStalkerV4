import express, {Router} from 'express';

import syncRoutes from './sync.router';
import trackerRoutes from './tracker.router';

const router = express.Router();

interface IRoute {
	path: string;
	route: Router;
}

const defaultIRoute: IRoute[] = [
	{
		path: '/track',
		route: trackerRoutes
	},
	{
		path: '/sync',
		route: syncRoutes
	}

];

defaultIRoute.forEach(route => {
	router.use(route.path, route.route);
});

export default router;
