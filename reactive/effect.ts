
export enum EffectFlags {
    /**
     * ReactiveEffect only
     */
    ACTIVE = 1 << 0,
    RUNNING = 1 << 1,
    TRACKING = 1 << 2,
    NOTIFIED = 1 << 3,
    DIRTY = 1 << 4,
    ALLOW_RECURSE = 1 << 5,
    PAUSED = 1 << 6,
  }

export let activeEffect: any = null
const targetMap = new WeakMap()

export function getActiveEffect(){
    return activeEffect
}

export function setActiveEffect(effect: any){
    activeEffect = effect
}

export function track(target: any, key: any){
    if(activeEffect){
        let map = targetMap.get(target)
        if(!map){
            targetMap.set(target, map = new Map())
        }
        let deps = map.get(key)
        if(!deps){
            map.set(key, (deps = new Set()))
        }
        deps.add(activeEffect)
    }
}

export function trigger(target: any, key: any){
    const map = targetMap.get(target)
    if(!map) return
    const deps = map.get(key)
    if(deps){
        deps.forEach((effect: any) => {
            effect()
        })
    }
}

export function effect(fn: Function){
    const prevActiveEffect = activeEffect
    activeEffect = fn
    try{
        fn()
    }finally{
        activeEffect = prevActiveEffect
    }
}

export function pauseTracking(){

}

export function resetTracking(){

}