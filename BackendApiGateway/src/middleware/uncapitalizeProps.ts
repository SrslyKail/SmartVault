import type { Request, Response, NextFunction } from 'express'

export const uncapitalizeReqBodyProperties = (req: Request, _: Response, next: NextFunction) => {
  
  const parsedJsonBody = req.body;
  const parsedJsonBodyLowercaseProps: any = {};

  // for each property in the req body,
  // lowercase the first character
  for (const key in parsedJsonBody) {
    if (parsedJsonBody.hasOwnProperty(key)) {
      parsedJsonBodyLowercaseProps[
        key.charAt(0).toLowerCase() + key.slice(1)
      ] = parsedJsonBody[key];
    }
    req.body = parsedJsonBodyLowercaseProps;
  }
  next();
}
