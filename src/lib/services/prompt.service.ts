import { injectable } from "@joist/di";

@injectable()
export class PromptService {
  alert(message: string) {
    window.alert(message);
  }
}
