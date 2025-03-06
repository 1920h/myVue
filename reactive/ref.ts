import { isObject } from "../share"
import { track, trigger } from "./effect"
import { reactive } from "./reactive"

export type Ref<T> = {
    value: T
}

export const ISREFSYMBOL = Symbol('isRef')

export function isRef(obj: any): Ref<any>{
    return obj && !!obj[ISREFSYMBOL]
}

export function ref(val?: any){
    return createRef(val)
}

export function unref<T>(val: Ref<T>| unknown): val is Ref<T>
export function unref(val: any){
    return isRef(val) ? val.value : val
}

export function shallowRef(val: any){
    return createRef(val)
}

export function toRef(val: any, key?: any, cb?: any){
    return createRef(val)
}

export function triggerRef(ref: Ref<any>){

}

export function toRefs<T>(obj: T): T{
    return obj
}

function createRef(val: any){
    return new RefImpl(val)
}

class RefImpl{

    private _rawValue: any
    private _value: any
    public [ISREFSYMBOL] = true

    constructor(value: any){
        this._rawValue = value
        this._value = isObject(value) ? reactive(value) : value
    }

    get value(){
        console.log('get value', this._value)
        track(this, "value")
        return this._value
    }

    set value(newValue: any){
        this._rawValue = newValue
        this._value = isObject(newValue) ? reactive(newValue) : newValue
        trigger(this, "value")
    }

}