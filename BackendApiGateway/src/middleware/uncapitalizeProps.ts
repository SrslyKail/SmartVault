import type { Request, Response, NextFunction } from 'express'

export const uncapitalizeReqBodyProperties = (req: Request, _: Response, next: NextFunction) => {
  
  const parsedJsonBody = req.body;
  const parsedJsonBodyLowercaseProps: any = {};

  for (const key in parsedJsonBody) {
    if (parsedJsonBody.hasOwnProperty(key)) {
      parsedJsonBodyLowercaseProps[key.toLowerCase()] = parsedJsonBody[key];
    }
    req.body = parsedJsonBodyLowercaseProps;
  }
  next();
}
