import { Request } from 'express';
// import { SessionData, Session } from 'express-session';

import { UserDocument } from './user/schema/user.schema';

interface ReqWithUser extends Request {
  user: UserDocument;
}

interface ReqWithPassport extends Request {
  passport: {
    user: UserDocument;
  };
}
