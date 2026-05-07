import type { ErrorRegistry } from "../types/index.ts";
export const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
}
export const isEmail = (text: unknown): text is string => isString(text) && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(text)

export const isPassword = (text: unknown): text is string => isString(text) && text.length >= 8


export const isUrl = (text: unknown): text is string => {
    return isString(text) && /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(text)
}
export const isObject = (object: unknown): object is object => !(!object || typeof object !== 'object')

export const isEmpty = (value: object | unknown[]) => {
    return Array.isArray(value) 
        ? value.length === 0 
        : Object.keys(value).length === 0
}
export const isValidObjectId = (id: unknown): id is string => isString(id) &&  /^[a-f\d]{24}$/i.test(id)

export const hasRequiredFields = <T extends Record<string, unknown>>(fields: (keyof T)[], object: object, registry: ErrorRegistry<T>): object is T => {
    fields.forEach(field => {
        if (!(field in object)) {
            registry[field] = `${String(field)} is required`
        }
           
    })
    return isEmpty(registry);
}