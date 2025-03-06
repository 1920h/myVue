
import { isObject, hasOwn, hasChange, isIntergerKey } from "../share"
import { track, trigger } from "./effect"
import { ReactiveFlag, ReactiveSkip, ReactiveRaw, isReactive, reactive, toRaw } from "./reactive"
import { isRef } from "./ref"

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
            if(isReactive(res)) return res
            if(isRef(res)){
                // console.log(typeof key, Array.isArray(target), res)
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
            console.log('set', key, value)
            const oldValue = target[key]
            const isOwn = hasOwn(receiver, key)
            if(isReactive(value)){
                value = toRaw(value)
            }
            if(isRef(oldValue)){
                oldValue.value = value
                return true
            }
            const result = Reflect.set(target, key, value, receiver)
            if(isOwn && hasChange(oldValue, value)){
                trigger(target, key)
            }
            return result
        }
    }