export const removeUndefinedObjectProps = (object: Record<string, any>) => {

  const objectKeys: string[] = Object.keys(object);

  objectKeys.forEach(key => {
    if (!object[key]) {
      delete object[key];
    }
  });

  return object;
}