import { isObject } from "../share"
import { track, trigger } from "./effect"
import { reactive, toReactive } from "./reactive"

export type Ref<T> = {
    value: T
}

export const ISREFSYMBOL = Symbol('isRef')

export function isRef(obj: any): Ref<any>{
    // console.log('isref',obj, obj[ISREFSYMBOL])
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
    if(isRef(val)) return val
    return new RefImpl(val)
}

class RefImpl{

    private _rawValue: any
    private _value: any
    public [ISREFSYMBOL] = true

    constructor(value: any){
        this._rawValue = value
        this._value = toReactive(value)
    }

    get value(){
        track(this, "value")
        return this._value
    }

    set value(newValue: any){
        if(newValue !== this._rawValue){
            this._rawValue = newValue
            this._value = isObject(newValue) ? reactive(newValue) : newValue
            trigger(this, "value")
        }
    }

}