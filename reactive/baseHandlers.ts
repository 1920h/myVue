
import { isObject, hasOwn, hasChange, isIntergerKey, isSymbol } from "../share"
import { track, trigger } from "./effect"
import { ReactiveFlag, ReactiveSkip, ReactiveRaw, isReactive, reactive, toRaw } from "./reactive"
import { isRef } from "./ref"

const builtInSymbols = new Set(
    /*@__PURE__*/
    Object.getOwnPropertyNames(Symbol)
      // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
      // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
      // function
      .filter(key => key !== 'arguments' && key !== 'caller')
      .map(key => Symbol[key as keyof SymbolConstructor])
      .filter(isSymbol),
  )

export const baseHandlers = {
        get(target: any, key: any, receiver: any){
            if(key === ReactiveSkip) return target[ReactiveSkip]
            if(key === ReactiveFlag) return true
            if(key === ReactiveRaw){
                if(Object.getPrototypeOf(receiver) === Object.getPrototypeOf(target)) return target
                return
            }
            const res = Reflect.get(target, key, receiver)
            track(target, key)
            if(isSymbol(key) && builtInSymbols.has(key)){
                return res
            }
            if(isRef(res)){
                if(isIntergerKey(key) && Array.isArray(target)){
                    return res
                }
                return res.value
            }
            if(isObject(res)){
                return reactive(res as Object)
            }
            return res
        },
        set(target: any, key: any, value: any, receiver: any){
            // console.log('set', key, value)
            const oldValue = target[key]
            if(isReactive(value)){
                value = toRaw(value)
            }
            if(isRef(oldValue) && !isRef(value)){
                oldValue.value = value
                return true
            }
            const result = Reflect.set(target, key, value, receiver)
            if(hasChange(oldValue, value)){
                if(Object.getPrototypeOf(receiver) === Object.getPrototypeOf(target)){
                    trigger(target, key)
                }
            }
            return result
        }
    }