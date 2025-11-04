import { isInteger, isEmpty } from 'lodash';
import {
  VibeHistoryContentSchema,
  VibeHistoryContentType,
} from './types/vibe-history-content';
import { SingleChatSchema, SingleChatType } from './types/single-chat';
import { ExportedVibeHistoryV1JsonType, VibeHistoryV1Methods } from './types/vibe-history-v1';


export class VibeHistoryModel implements VibeHistoryV1Methods {
  public content: VibeHistoryContentType;

  static fromJson(input: string): VibeHistoryModel {
    let parsedData: object;

    try {
      parsedData = JSON.parse(input);
    } catch (error) {
      throw new SyntaxError(`解析 JSON 失败: ${(error as Error).message}`);
    }

    if ('version' in parsedData && parsedData.version === 'v1') {
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

  constructor(content: VibeHistoryContentType) {
    this.content = content;
  }

  private validateIndex(index: number): void {
    if (!isInteger(index)) {
      throw new TypeError(`index 必须是整数，当前值为 ${index}`);
    }

    if (index < 0 || index >= this.content.chat_list.length) {
      throw new RangeError(`index 超出范围 (0 ~ ${this.content.chat_list.length - 1})，当前值为 ${index}`);
    }
  }

  private validateNonEmptyString(value: string, fieldName: string): void {
    if (typeof value !== 'string' || isEmpty(value.trim())) {
      throw new TypeError(`${fieldName} 必须是非空字符串`);
    }
  }

  public unselectChatAtIndex(index: number): void {
    this.validateIndex(index);
    this.content.chat_list[index].is_select = false;
  }

  public selectChatAtIndex(index: number): void {
    this.validateIndex(index);
    this.content.chat_list[index].is_select = true;
  }

  public editNameAtIndex(index: number, newName: string): void {
    this.validateNonEmptyString(newName, 'newName');
    this.validateIndex(index);
    this.content.chat_list[index].name = newName;
  }

  public editIdeName(newName: string): void {
    this.validateNonEmptyString(newName, 'newName');
    this.content.ide_name = newName;
  }

  public appendChatHistory(chat: SingleChatType): void {
    const normalized = SingleChatSchema.parse(chat);
    this.content.chat_list = [...this.content.chat_list, normalized];
  }

  public toJSON(): ExportedVibeHistoryV1JsonType {
    return {
      version: "v1",
      content: {
        ide_name: this.content.ide_name,
        chat_list: this.content.chat_list
          .filter((chat: SingleChatType) => chat.is_select)
          .map(({ is_select: _, ...rest }: SingleChatType) => rest),
      },
    };
  }
}
