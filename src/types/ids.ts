export const resourceID = (namespace: string, name: string) =>
  `ns/${namespace}/${name}`;

export const partsFromResourceID = (id: string) => {
  const [_, namespace, name] = id.split('/');
  return { namespace, name };
};

export const historyID = (namespace: string, name: string, rev: string) =>
  `hist/${namespace}/${name}/${rev}`;

export const partsFromHistoryID = (id: string) => {
  const [_, namespace, name, rev] = id.split('/');
  return { namespace, name, rev };
};

export const historyKindID = (name: string, rev: string) =>
  `hist/${name}/${rev}/kind`;

export const kindID = (name: string) => `kind/${name}`;
