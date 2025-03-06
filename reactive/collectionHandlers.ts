import { hasOwn, isObject } from "../share"
import { track, trigger } from "./effect"
import { ReactiveSkip, ReactiveFlag, ReactiveRaw, toRaw, reactive } from "./reactive"


function set(this: any, key: any, value: any){
    console.log('set', key, value, this)
    const raw = toRaw(this)
    raw.set(key, value)
    trigger(raw, key)
}

function get(this: any, key: any){
    const raw = toRaw(this)
    track(raw, key)
    const res = raw.get(key)
    return isObject(res) ? reactive(res) : res
}

function add(this: any, value: any){
    const raw = toRaw(this)
    raw.add(value)
    trigger(raw, value)
}

function deleted(this:any, key: any){
    const raw = toRaw(this)
    raw.delete(key)
    trigger(raw, key)
}

function has(this: any, key: any){
    const raw = toRaw(this)
    track(raw, key)
    return raw.has(key)
}

const mapCollectionHandler = {
    set,
    get,
    has,
    add,
    delete: deleted
}

const collectionHandlers = {
    get(target: any, key: any,receiver: any){
        if(key === ReactiveSkip) return target[ReactiveSkip]
        if(key === ReactiveFlag) return true
        if(key === ReactiveRaw){
            if(Object.getPrototypeOf(receiver) === Object.getPrototypeOf(target)) return target
            return
        }
        if(hasOwn(mapCollectionHandler, key)){
            return Reflect.get(mapCollectionHandler, key, receiver)
        }
        console.log('key===', key)
        return Reflect.get(target, key, receiver)
    }
}

export { collectionHandlers }