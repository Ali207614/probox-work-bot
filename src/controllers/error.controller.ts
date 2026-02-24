export class ErrorController {
  handle(error: Error): void {
    console.error('❌ Polling error:', error.message);
  }
}
