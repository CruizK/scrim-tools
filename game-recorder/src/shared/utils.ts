type MainToRendererNames<T extends string> = {
  mType: `${T}`;
  rType: `on_${T}`
}

export function types<T extends string>(name: T): MainToRendererNames<T> {
  return {
    mType: `${name}`,
    rType: `on_${name}`
  }
}
