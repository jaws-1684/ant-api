export type Infer<T extends WType<any>> = T extends WType<infer O> ? O : never
export type ParseContext<T = unknown> = {
  value: T
  issues: WIssue[]
}
export type WIssue = {
  message: string
  fatal?: boolean
  path: PropertyKey[]
}
export type Ok<T> = { ok: true; data: T }
export type Err = { ok: false; error: WError }
export type Either<S> = Ok<S> | Err

const err = (issues: WIssue[]): Err => ({ ok: false, error: new WError(issues) });
const ok = <T>(data: T): Ok<T> => ({ ok: true , data });
export const isErr = <O>(obj: Either<O>): obj is Err => obj.ok === false;
export const isOk = <O>(obj: Either<O>): obj is Ok<O> => obj.ok === true;

// -------------------------------------------------------------------------------------
// REGEXES
// -------------------------------------------------------------------------------------

const EMAIL_REGEX =
    /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i
const URL_REGEX =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/i
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i    
// -------------------------------------------------------------------------------------
// Predicates
// -------------------------------------------------------------------------------------

const isString = (v: unknown): v is string => typeof v === 'string' || v instanceof String;
const isEmail = (v: unknown): v is string => isString(v) && EMAIL_REGEX.test(v)
const isPassword = (v: unknown): v is string => isString(v) && v.length >= 8
const isUrl = (v: unknown): v is string => isString(v) && URL_REGEX.test(v)
const isObject = (object: unknown): object is Record<any, any> => !(!object || typeof object !== 'object')
const isEmpty = (value: object | unknown[]) => {
    return Array.isArray(value) 
        ? value.length === 0 
        : Object.keys(value).length === 0
}
const isInteger = (v: unknown): v is Number => Number.isInteger(Number(v));
const isNumber = (v: unknown): v is Number => !(Number.isNaN(Number(v)));
const isObjectId = (id: unknown): id is string => isString(id) &&  OBJECT_ID_REGEX.test(id)
// -------------------------------------------------------------------------------------
// Exports
// -------------------------------------------------------------------------------------
export function optional<T extends WType<any>>(schema: T) {
  return new WOptional(schema)
}
export function object<T extends Record<PropertyKey, WType<any>>>(
  inner: T
) {
  return new WObject(inner)
}
export function string() {
  return new WString()
}
export function email() {
  return new WEmail()
}
export function password() {
  return new WPassword()
}
export function url() {
  return new WUrl()
}
export function objectId() {
  return new WObjectId()
}
export function number() {
  return new WNumber()
}
export function int() {
  return new WInt()
}


// -------------------------------------------------------------------------------------
// Classes
// -------------------------------------------------------------------------------------
export class WError extends Error {
  issues: WIssue[]

  constructor(issues: WIssue[]) {
    super(JSON.stringify(issues))

    this.name = "WError"
    this.issues = issues
  }
}

export abstract class WType<T> {
    protected validators: Array<(ctx: ParseContext<T>) => boolean> = []
    protected customValidators: Array<(ctx: ParseContext<T>) => boolean> = []
    protected transforms: Array<(input: T) => T> = []
    protected coerces: Array<(input: T) => T> = []
    protected abstract validate(ctx: ParseContext): ParseContext

    #default: T | undefined

    parse(input: unknown): T {
        const result = this.safeParse(input)
        if (isOk(result)) return result.data
        throw result.error
    }

    safeParse(
        input: unknown
    ): Either<T> {
        if (input === undefined && this.#default !== undefined) {
            return ok(this.#default)
        }
        const result = this.validate({ value: input, issues: [] })

        if (result.issues.some(issue => issue.fatal && issue.path.length === 0)) {
            return err(result.issues)
        }

        const okData = result as ParseContext<T>

        this.validators.forEach(fn => fn(okData))

        if (result.issues.some(issue => issue.fatal)) {
            return err(okData.issues)
        }
        this.customValidators.forEach(fn => fn(okData))
        
        if (!isEmpty(okData.issues)) {
            return err(okData.issues)
        }
        return ok(this.transforms.reduce((acc, fn) => fn(acc), okData.value))
    }
    optional() {
      return optional(this)
    }
    transform<Out>(fn: (input: T) => Out) {
      return new WTransform<Out, T>(this, fn)
    }
    default(val: T) {
        this.#default = val

        return this
    }
    refine(fn: (input: T) => boolean, message: string) {
    this.customValidators.push(ctx => {
      if (fn(ctx.value)) return true

      ctx.issues.push({ message, path: [] })

      return false
    })

    return this
  }
}

class WTransform<Out, In> extends WType<Out> {
  #inputSchema: WType<In>
  #transformFn: (input: In) => Out

  constructor(schema: WType<In>, transformFn: (input: In) => Out) {
    super()
    this.#inputSchema = schema
    this.#transformFn = transformFn
  }

  protected validate(ctx: ParseContext) {
    const res = this.#inputSchema.safeParse(ctx.value)

    if (isOk(res)) {
      ctx.value = this.#transformFn(res.data)
    } else {
      ctx.issues.push(...res.error.issues)
    }

    return ctx
  }
}
class WOptional<T extends WType<any>> extends WType<
  undefined | Infer<T>
> {
  #schema: T
  constructor(schema: T) {
    super()
    this.#schema = schema
  }

  protected validate(ctx: ParseContext) {
    if (ctx.value === undefined) return ctx
    const result = this.#schema.safeParse(ctx.value)
    if (isOk(result)) {
      ctx.value = result.data
    } else {
      ctx.issues.push(...result.error.issues)
    }

    return ctx
  }
}

class WObject<
  const Schema extends Record<PropertyKey, WType<any>>,
  Output extends {
    [K in keyof Schema]: Schema[K] extends WType<infer O> ? O : never
  }
> extends WType<Output> {
  #schema: Schema

  constructor(schema: Schema) {
    super()
    this.#schema = schema
  }

  protected validate(ctx: ParseContext) {
    if (!isObject(ctx.value)) {
      ctx.issues.push({ message: "Expected object", path: [], fatal: true })
      return ctx
    }

    const successCtx = ctx as ParseContext<Record<PropertyKey, unknown>>

    for (const key in this.#schema) {
      const innerRes = this.#schema[key].safeParse(successCtx.value[key])

      if (isOk(innerRes)) {
        if (key in successCtx.value || innerRes.data !== undefined) {
          successCtx.value[key] = innerRes.data
        }
      } else {
        ctx.issues.push(
          ...innerRes.error.issues.map(issue => {
            return {
              ...issue,
              path: [key, ...issue.path],
            }
          })
        )
      }
    }

    return ctx
  }
}
class WString extends WType<string> {
  protected validate(ctx: ParseContext) {
    if (isString(ctx.value)) return ctx

    ctx.issues.push({ path: [], message: "Expected string", fatal: true })

    return ctx
  }
 
  min(length: number) {
    this.validators.push(ctx => {
      if (ctx.value.length >= length) return true

      ctx.issues.push({ path: [], message: `String is too short, minumum length: ${length}` })

      return false
    })

    return this
  }

  max(length: number) {
    this.validators.push(ctx => {
      if (ctx.value.length <= length) return true

      ctx.issues.push({ path: [], message: `String is too short, maximun length: ${length}` })

      return false
    })

    return this
  }

  length(length: number) {
    this.validators.push(ctx => {
      if (ctx.value.length === length) return true

      ctx.issues.push({ path: [], message: "String is not the exact length" })

      return false
    })

    return this
  }

  regex(pattern: RegExp) {
    this.validators.push(ctx => {
      if (ctx.value.match(pattern)) return true

      ctx.issues.push({
        path: [],
        message: "String does not match the pattern",
      })

      return false
    })

    return this
  }

  trim() {
    this.transforms.push(input => input.trim())
    return this
  }

  toLowerCase() {
    this.transforms.push(input => input.toLowerCase())
    return this
  }

  toUpperCase() {
    this.transforms.push(input => input.toUpperCase())
    return this
  }
  toInteger() {
    return int()
  }
  escape() {
    this.transforms.push(input => input.replace(
        /[^0-9A-Za-z ]/g,
        c => "&#" + c.charCodeAt(0) + ";"))
    return this
  }
}


class StringExtension extends WString {
    ctx: ParseContext
    isPredicate: (value: string) => boolean
    message: string

    constructor (ctx: ParseContext, isPredicate: (value: string) => boolean, message: string) {
        super()
        this.ctx = ctx,
        this.isPredicate = isPredicate,
        this.message = message
    }
    validate() {
        const newCtx = super.validate(this.ctx)
        if (this.ctx.issues.length !== newCtx.issues.length) return newCtx

        const stringCtx = newCtx as ParseContext<string>

        if (this.isPredicate(stringCtx.value)) return stringCtx

        stringCtx.issues.push({ path: [], message: this.message })

        return stringCtx
    }
}
class WEmail extends WString {
  protected validate(ctx: ParseContext) {
    return new StringExtension(ctx, isEmail, "Invalid email").validate()
  }
}
class WUrl extends WString {
  protected validate(ctx: ParseContext) {
    return new StringExtension(ctx, isUrl, "Invalid url").validate()
  }
}
class WObjectId extends WString {
  protected validate(ctx: ParseContext) {
    return new StringExtension(ctx, isObjectId, "Invalid object id").validate()
  }
}
class WPassword extends WString {
  protected validate(ctx: ParseContext) {
    return new StringExtension(ctx, isPassword, "Invalid password").validate()
  }
}

class WNumber extends WType<number> {
  protected validate(ctx: ParseContext) {
    if (typeof ctx.value === "number" && Number.isFinite(ctx.value)) {
      return ctx
    }
    ctx.issues.push({ path: [], message: "Expected number", fatal: true })

    return ctx
  }

  min(n: number) {
    this.validators.push(ctx => {
      if (ctx.value >= n) return true

      ctx.issues.push({ path: [], message: "Number is too small" })

      return false
    })

    return this
  }

  max(n: number) {
    this.validators.push(ctx => {
      if (ctx.value <= n) return true

      ctx.issues.push({ path: [], message: "Number is too large" })

      return false
    })

    return this
  }

  positive() {
    this.validators.push(ctx => {
      if (ctx.value > 0) return true

      ctx.issues.push({ path: [], message: "Number must be positive" })

      return false
    })

    return this
  }

  negative() {
    this.validators.push(ctx => {
      if (ctx.value < 0) return true

      ctx.issues.push({ path: [], message: "Number must be negative" })

      return false
    })

    return this
  }
}

class WInt extends WNumber {
  protected validate(ctx: ParseContext) {
    const newCtx = super.validate(ctx)
    if (ctx.issues.length !== newCtx.issues.length) return newCtx

    const numberCtx = newCtx as ParseContext<number>

    if (isInteger(ctx.value)) return ctx
    numberCtx.issues.push({ path: [], message: "Expected integer" })

    return numberCtx
  }
}

class CoercedNumber extends WNumber {
  protected validate(ctx: ParseContext): ParseContext {
    if (isNumber(ctx.value)) {
      return { ...ctx, value: Number(ctx.value)}
    } else {
      ctx.issues.push({ path: [], message: "Can't coerce to number", fatal: true })
    }
    return super.validate(ctx)
  }
  int() {
    return new CoercedInterger()
  }
}
class CoercedInterger extends WInt {
  protected validate(ctx: ParseContext): ParseContext {
    if (isInteger(ctx.value)) {
      return { ...ctx, value: Number(ctx.value)}
    } else {
      ctx.issues.push({ path: [], message: "Can't coerce to integer" })
    }
    return super.validate(ctx)
  }
}
export const coerce = {
  number: () => new CoercedNumber()
}
