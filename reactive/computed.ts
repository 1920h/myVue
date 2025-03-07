import { isFunction, noop } from "../share"
import { activeEffect, getActiveEffect, setActiveEffect, track, trigger } from "./effect"
import { ISREFSYMBOL, Ref } from "./ref"

declare const ComputedRefSymbol: unique symbol

interface BaseComputedRef<T, S = T> extends Ref<T, S> {
    [ComputedRefSymbol]: true
    /**
     * @deprecated computed no longer uses effect
     */
    effect: ComputedRefImpl
  }
  
  export interface ComputedRef<T = any> extends BaseComputedRef<T> {
    readonly value: T
  }

export function computed<T>(fn: (val: any) => T): ComputedRefImpl
export function computed<T>(obj: { get: () => T; set: (v: T) => void }): ComputedRefImpl
export function computed(fn: any){
    return new ComputedRefImpl(fn)
}

export class ComputedRefImpl{

    private getter
    private setter
    private _value
    private _dirty = true
    private [ISREFSYMBOL] = true
    readonly deps = []
    public flags


    constructor(fn: any){
        if(isFunction(fn)){
            this.getter = fn
        }else{
            this.getter = fn.get
            this.setter = fn.set
        }
        this.notify = this.notify.bind(this)
    }

    notify(){
        this._dirty = true
        // setActiveEffect(this)
        trigger(this, "value")
    }

    get value(){
        if(!this._dirty) return this._value
        this._dirty = false
        track(this, "value")
        const prevActiveEffect = getActiveEffect()
        setActiveEffect(this.notify)
        try{
            return this._value = this.getter(this._value)
        }finally{
            // trigger(this, "value")
            setActiveEffect(prevActiveEffect)
        }
    }

    set value(val: any){
        if(this.setter){
            this.setter(val)
        }
    }

}

