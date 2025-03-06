
const _hasOwn = Object.prototype.hasOwnProperty

export function isObject(obj: any){
    return obj !== null && typeof obj === 'object'
}

export function isFunction(fn: any){
    return typeof fn === 'function'
}

export function hasChange(val1: any, val2: any){
    return val1 !== val2
}

export function hasOwn(obj: any, key: any){
    return _hasOwn.call(obj, key)
}

export const def = (
    obj: object,
    key: string | symbol,
    value: any,
    writable = false,
  ): void => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      writable,
      value,
    })
  }

export function noop(){}