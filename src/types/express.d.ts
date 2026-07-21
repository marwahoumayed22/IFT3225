import { DeviceDocument } from '../models/Device';
import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      device?: DeviceDocument;
      user?: UserDocument;
    }
  }
}

export {};
