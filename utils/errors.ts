import { Error as MongooseError } from "mongoose";
import { WError } from "./w.ts";

interface ExternalErrorConstructor {
    new (error: Error): ExternalError
    handles: (e: Error) => boolean
}
export class AppError extends Error {
    constructor() { 
        super()
        this.name = this.constructor.name
    }
    msg      = (): string => 'Something went wrong'
    status   = (): number => 500
    toObject = (): { status: number; error: { message: string; details?: string } } => ({
        status: this.status(),
        error: { message: this.msg() }
    })
}

export class UnauthorizedError       extends AppError { msg = () => 'Unauthorized';       status = () => 401 }
export class ForbiddenError          extends AppError { msg = () => 'Forbidden';           status = () => 403 }
export class NotFoundError           extends AppError { msg = () => 'Not found';           status = () => 404 }
export class InvalidCredentialsError extends AppError { msg = () => 'Invalid credentials'; status = () => 401 }

export class NotAcceptedError extends AppError {
    constructor(message?: string) {
        super()
        this.message = message ?? 'Not acceptable'
    }
    msg    = () => this.message
    status = () => 406
};

export class ValidationError extends AppError {
    details?: string
    constructor(details?: any, message?: string) {
        super()
        this.message = message ?? 'Validation failed'
        this.details = details
    }
    msg      = () => this.message
    status   = () => 400
    toObject = () => {
        return {
            error: {
                message: this.msg(),
                details: this.details
            },
            status: this.status()
        }};
};

export class ExternalError extends AppError {
    error: Error | undefined
    constructor(error?: Error) {
        super()
        this.error = error
        this.message = error?.message ?? "External error"
    }
    static externalErrorRegistry: ExternalErrorConstructor[] = []
    static register  = (obj: any) => ExternalError.externalErrorRegistry.push(obj)
    static canHandle = (e: Error) => ExternalError.externalErrorRegistry.some(cls => cls.handles(e))
    static handles   = (_e: Error): boolean => false
    static errorFor  = (e: Error): ExternalErrorConstructor => ExternalError.externalErrorRegistry.find(cls => cls.handles(e))!
};

export class MongoCastError extends ExternalError {
    msg    = () => 'Invalid id'
    status = () => 400
    static handles = (e: Error) => e instanceof MongooseError.CastError
    static { this.register(this) }
};

export class MongoValidationError extends ExternalError {
    constructor(error: Error) { super(error) }

    msg    = () => this.message.split(':')[0] ?? 'Validation error'
    status = () => 400
    details = () => {
        const validationError = this.error as MongooseError.ValidationError
        return JSON.stringify(Object.fromEntries(
            Object.entries(validationError.errors).map(([field, error]) => {
                const message = error.message
                    .replace(/Path/, '')
                    .replaceAll('`', '')
                    .trim()
                return [field, message]
            })
        ));
    };
    toObject = () => {
        return {
            error: {
                message: this.msg(),
                details: this.details()
            },
            status: this.status()
        }};
    static handles = (e: Error) => e instanceof MongooseError.ValidationError
    static { this.register(this) }
};

export class MongoDuplicateKeyError extends ExternalError {
    constructor(error: Error) {
        super(error)
        const field = error.message.match(/index: (\w+)_/)?.[1] ?? 'field'
        this.message = `${field} is already taken`
    }
    static handles = (e: Error) => 
        e.name === 'MongoServerError' && e.message.includes('E11000')
    msg = () => this.message
    status = () => 409
    static { this.register(this) }
}
export class MongoNotFoundError extends ExternalError {
    msg    = () => 'Not found'
    status = () => 404
    static handles = (e: Error) => e instanceof MongooseError.DocumentNotFoundError
    static { this.register(this) }
}
export class JwtInvalidError extends ExternalError {
    msg    = () => 'Invalid token'
    status = () => 401
    static handles = (e: Error) => e.name === 'JsonWebTokenError'
    static { this.register(this) }
}

export class JwtExpiredError extends ExternalError {
    msg    = () => 'Token expired'
    status = () => 401
    static handles = (e: Error) => e.name === 'TokenExpiredError'
    static { this.register(this) }
}
export const toAppError = (error: Error): AppError | null => {
    if (error instanceof WError) return new ValidationError("Validation error", error.message)
    if (error instanceof AppError) return error
    if (ExternalError.canHandle(error)) return new (ExternalError.errorFor(error))(error)
    return null
}