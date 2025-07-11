export const json_equal_to =
  (exception: (key: string) => boolean) =>
  <T>(x: T) =>
  (y: T | null | undefined): string[] => {
    const container: string[] = [];
    const iterate =
      (accessor: string) =>
      (x: any) =>
      (y: any): void => {
        if (typeof x === "function" || typeof y === "function") return;
        else if (typeof x !== typeof y) container.push(accessor);
        else if (x instanceof Array)
          if (!(y instanceof Array)) container.push(accessor);
          else array(accessor)(x)(y);
        else if (x instanceof Object) object(accessor)(x)(y);
        else if (x !== y) container.push(accessor);
      };
    const array =
      (accessor: string) =>
      (x: any[]) =>
      (y: any[]): void => {
        if (x.length !== y.length) container.push(`${accessor}.length`);
        x.forEach((xItem, i) => iterate(`${accessor}[${i}]`)(xItem)(y[i]));
      };
    const object =
      (accessor: string) =>
      (x: any) =>
      (y: any): void =>
        Object.keys(x)
          .filter((key) => x[key] !== undefined && !exception(key))
          .forEach((key) => iterate(`${accessor}.${key}`)(x[key])(y[key]));

    iterate("")(x)(y);
    return container;
  };
