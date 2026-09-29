import express from 'express';
import { markNotificationAsRead, getNotification , createTestNotification} from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';

const notificationRouter = express.Router();

notificationRouter.get("/", verifyToken, getNotification);

notificationRouter.patch("/:id/read", verifyToken, markNotificationAsRead);
export default notificationRouter;