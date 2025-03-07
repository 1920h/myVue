

const resolvePromise = Promise.resolve()

export function nextTick(this: any, fn?:()=> void){
    return fn ? resolvePromise.then(this ? fn.bind(this) : fn) : resolvePromise
}