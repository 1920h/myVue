import { isFunction, noop } from "../share"
import { activeEffect, getActiveEffect, setActiveEffect, track } from "./effect"
import { ISREFSYMBOL } from "./ref"

export function computed(fn: any){
    return new ComputedRefImpl(fn)
}

class ComputedRefImpl{

    private getter = noop
    private setter = noop
    private _value: any = null
    private _dirty = true
    private [ISREFSYMBOL] = true
    private deps = []


    constructor(fn: any){
        if(isFunction(fn)){
            this.getter = fn
        }else{
            this.getter = fn.get
            this.setter = fn.set
        }
    }

    get value(){
        if(!this._dirty) return this._value
        this._dirty = false
        const prevActiveEffect = getActiveEffect()
        setActiveEffect(()=>{
            this._dirty = true
        })
        track(this, "value")
        try{
            return this._value = this.getter()
        }finally{
            setActiveEffect(prevActiveEffect)
        }
    }

}

