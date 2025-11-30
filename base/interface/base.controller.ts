export abstract class BaseController {
  protected success<T = unknown>(data: T) {
    return {
      success: true,
      data,
    };
  }

  protected failure(message: string, statusCode = 400) {
    return {
      success: false,
      error: {
        message,
        statusCode,
      },
    };
  }
}
