import { test } from '@playwright/test';

type AsyncMethod<This, Args extends readonly unknown[], Return> = (
  this: This,
  ...args: Args
) => Promise<Return>;

/** Shows each call of the decorated method as one named step (Class.method) in the report. */
export function step<This extends object, Args extends readonly unknown[], Return>(
  target: AsyncMethod<This, Args, Return>,
  context: ClassMethodDecoratorContext<This, AsyncMethod<This, Args, Return>>,
): AsyncMethod<This, Args, Return> {
  return function (this: This, ...args: Args): Promise<Return> {
    const stepTitle = `${this.constructor.name}.${String(context.name)}`;
    return test.step(stepTitle, () => target.call(this, ...args), { box: true });
  };
}
