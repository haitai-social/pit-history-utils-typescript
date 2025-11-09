import { JSON_VERSION } from "./common/version";
import { VibeHistoryFactoryMethods } from "./types/vibe-history";
import { VibeHistoryContentSchema } from "./types/vibe-history-content";
import { SingleChatSchema, SingleChatType } from "./types/single-chat";
import { VibeHistoryModel } from "./vibe-history-model";

class VibeHistoryFactoryImpl implements VibeHistoryFactoryMethods {
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

    public fromCodexHistory(input: string): VibeHistoryModel {
        const lines = input.split('\n').filter(line => line.trim().length > 0);
        const chatList: SingleChatType[] = [];
        let codexContextModel = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let parsedData: any;
            let parsedType: string;

            try {
                parsedData = JSON.parse(line);
                parsedType = (parsedData as any)['type'];
            } catch (error) {
                throw new SyntaxError(`line ${i + 1} parse JSON failed: ${line}, error: ${(error as Error).message}`);
            }

            switch (parsedType) {
                case 'turn_context':
                    if (parsedData.payload && parsedData.payload.model) {
                        codexContextModel = parsedData.payload.model;
                    }
                    continue;
                case 'response_item':
                    const singleChat = this.convertCodexRecordToSingleChat(parsedData, codexContextModel);
                    if (singleChat) {
                        chatList.push(singleChat);
                    }
                    break;
                default:
                    continue;
            }
        }

        const content = VibeHistoryContentSchema.parse({
            ide_name: 'codex',
            chat_list: chatList,
        });

        return new VibeHistoryModel(content);
    }

    public fromFileText(input: string): VibeHistoryModel {
        try {
            return this.fromCodexHistory(input);
        } catch (error) {
            // 如果 fromCodexHistory 失败，则尝试 fromJson
            return this.fromJson(input);
        }
    }

    private convertCodexRecordToSingleChat(codexRecord: any, codexModel: string): SingleChatType | null {
        if (codexRecord.type !== 'response_item') {
            return null;
        }
        const payload = codexRecord.payload;
        if (payload.type !== 'message') {
            return null;
        }

        const role = payload.role;
        if (role !== 'user' && role !== 'assistant') {
            return null;
        }

        const contentParts: string[] = [];
        switch (role) {
            case 'user':
                {
                    if (!Array.isArray(payload.content)) {
                        return null;
                    }
                    for (const item of payload.content) {
                        if (item.type === 'input_text') {
                            contentParts.push(item.text);
                        }
                    }
                    break;
                }
            case 'assistant':
                {
                    if (!Array.isArray(payload.content)) {
                        return null;
                    }
                    for (const item of payload.content) {
                        if (item.type === 'output_text') {
                            contentParts.push(item.text);
                        }
                    }
                    break;
                }
            default:
                return null;
        }

        const content = contentParts.join('\n');
        return SingleChatSchema.parse({
            role: role,
            name: codexModel,
            content: content,
            is_select: true,
        });
    }
}

// 导出默认实例，方便使用
export const VibeHistoryFactory = new VibeHistoryFactoryImpl();