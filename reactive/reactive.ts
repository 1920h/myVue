import { isFunction, isObject } from "../share"

const ReactiveFlag = Symbol('reactive')

function reactive(obj: any){
    return new Proxy(obj, {
        get(target, key, receiver){
            if(key === ReactiveFlag) return true
            const res = Reflect.get(target, key, receiver)
            console.log('res', res)
            return isObject(res) ? reactive(res as Object) : isFunction(res) ? res.bind(target) : res
        },
        set(target, key, value, receiver){
            return Reflect.set(target, key, value, receiver)
        },
        apply(target, thisArg, argArray){
            console.log('apply', argArray)
            return Reflect.apply(target, thisArg, argArray)
        }
    })
}

function isReactive(obj: any){
    console.log(obj)
    return obj && !!obj[ReactiveFlag]
}


export { reactive, isReactive }