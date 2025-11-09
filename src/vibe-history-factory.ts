import { JSON_VERSION } from "./common/version";
import { VibeHistoryFactoryMethods } from "./types/haitai-history/vibe-history";
import { VibeHistoryContentSchema } from "./types/haitai-history/vibe-history-content";
import { VibeHistoryModel } from "./vibe-history-model";

export class VibeHistoryFactory implements VibeHistoryFactoryMethods {
    public fromJson(input: string): VibeHistoryModel {
        let parsedData: object;
    
        try {
          parsedData = JSON.parse(input);
        } catch (error) {
          throw new SyntaxError(`Failed to parse JSON: ${(error as Error).message}`);
        }
    
        if ('version' in parsedData && parsedData.version === JSON_VERSION) {
          if (!('content' in parsedData)) {
            throw new Error("Missing 'content' property in v1 history data");
          }
          const content = VibeHistoryContentSchema.parse((parsedData as any)['content']);
          return new VibeHistoryModel(content);
        } else {
          const content = VibeHistoryContentSchema.parse(parsedData);
          return new VibeHistoryModel(content);
        }
    }
}