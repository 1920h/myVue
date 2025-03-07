import { def, hasOwn, isObject } from "../share"
import { baseHandlers } from "./baseHandlers"
import { collectionHandlers } from './collectionHandlers'
import { isRef } from "./ref"

enum TargetType{
    COMMOM,
    COLLECTION,
    INVALID
}

export const ReactiveFlag = Symbol('reactive')
export const ReactiveRaw = Symbol('reactiveRaw')
export const ReactiveShallow = "__v_isShallow"
export const ReactiveSkip = "__v_skip"
const ReactiveMap = new WeakMap()

function toString(target:any){
    return Object.prototype.toString.call(target).slice(8, -1)
}

function targetTypeMap(rawType: string){
    switch(rawType){
        case 'Object':
        case 'Array':
            return TargetType.COMMOM
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

function getTargetType(target: any){
    return (target[ReactiveSkip] || !Object.isExtensible(target))
    ? TargetType.INVALID : targetTypeMap(toString(target))
}

function reactive<T>(obj: T) : T
function reactive(obj: any){
    if(!isObject(obj) || isRef(obj)) return obj
    if(isReactive(obj)) return obj
    if(getTargetType(obj) === TargetType.INVALID) return obj
    if(ReactiveMap.has(obj)) return ReactiveMap.get(obj)
    const proxy = new Proxy(obj, targetTypeMap(toString(obj)) === TargetType.COMMOM ? baseHandlers : collectionHandlers)
    ReactiveMap.set(obj, proxy)
    return proxy
}

function isReactive(obj: any){
    return obj && !!obj[ReactiveFlag]
}

function isShallow(obj: any){
    return obj && !!obj[ReactiveShallow]
}

function isReadonly(obj: any): boolean{
    return true
}

function toRaw(obj: any): any{
    const raw = obj && obj[ReactiveRaw]
    return raw ? raw : obj
}

function markRaw(obj: any){
    if(!hasOwn(obj, ReactiveSkip) && Object.isExtensible(obj)){
        def(obj, ReactiveSkip, true)
    }
    return obj
}

function toReactive(obj: any){
    return isObject(obj) ? reactive(obj) : obj
}

export { reactive, isReactive, toRaw, markRaw, isShallow, isReadonly, toReactive }