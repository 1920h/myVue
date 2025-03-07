import { isFunction, isObject } from "../share"
import { track, trigger } from "./effect"
import { reactive, ReactiveShallow, toRaw, toReactive } from "./reactive"

declare const RefSymbol: unique symbol
export declare const RawSymbol: unique symbol

export interface Ref<T = any, S = T> {
  get value(): T
  set value(_: S)
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
}

export const ISREFSYMBOL = Symbol('isRef')

export function isRef(obj: any): boolean{
    // console.log('isref',obj, obj[ISREFSYMBOL])
    return !!(obj && !!obj[ISREFSYMBOL])
}

export function ref<T>(val?: T): Ref<T>
export function ref(val?: any){
    return createRef(val, false)
}

export function unref<T>(val: Ref<T>| unknown): val is Ref<T>
export function unref(val: any){
    return isRef(val) ? val.value : val
}

export function shallowRef<T>(val?: T): Ref<T>
export function shallowRef(val: any){
    return createRef(val, true)
}

export function toRef(obj: any, key?: any, cb?: any){
    if(isRef(obj)) return obj
    else if(isFunction(obj)){
        return new GetterRefImpl(obj)
    }
    const _val = obj[key]
    return isRef(_val) ? _val : new ObjectRefImpl(obj, key, cb)
}

export function triggerRef(ref: Ref<any>){
    trigger(ref, "value")
}

export function toRefs<T>(obj: T): T{
    return obj
}

function createRef(val: any, isShallow: boolean){
    if(isRef(val)) return val
    return new RefImpl(val, isShallow)
}

class RefImpl{

    private _rawValue: any
    private _value: any
    public [ISREFSYMBOL] = true
    private _shallow: boolean
    public [ReactiveShallow] = false

    constructor(value: any, isShallow: boolean){
        this._rawValue = isShallow ? value : toRaw(value)
        this._value = isShallow ? value : toReactive(value)
        this._shallow = isShallow
        this[ReactiveShallow] = isShallow
    }

    get value(){
        track(this, "value")
        return this._value
    }

    set value(newValue: any){
        console.log('set', newValue)
        if(newValue !== this._rawValue){
            this._rawValue = this._shallow ? newValue : toRaw(newValue)
            this._value = this._shallow ? newValue : reactive(newValue)
            trigger(this, "value")
        }
    }

}

class ObjectRefImpl{

    public [ISREFSYMBOL] = true
    private _object: any
    private _value: string
    private _defaultValue: any

    constructor(obj: any, value: string, defaultValue: any){
        this._object = obj
        this._value = value
        this._defaultValue = defaultValue
    }

    get value(){
        const _val = this._object[this._value]
        return _val == undefined ? this._defaultValue : _val
    }

    set value(newVal){
        this._object[this._value] = newVal
    }
}

class GetterRefImpl{

    public [ISREFSYMBOL] = true
    private _getter: any

    constructor(getter: any){
        this._getter = getter
    }

    get value(){
        return this._getter()
    }

}