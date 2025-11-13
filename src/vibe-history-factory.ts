import { JSON_VERSION } from "./common/version";
import { VibeHistoryFactoryMethods } from "./types/vibe-history";
import { VibeHistoryContentSchema } from "./types/vibe-history-content";
import { SingleChatSchema, SingleChatType } from "./types/single-chat";
import { VibeHistoryModel } from "./vibe-history-model";

class VibeHistoryFactoryImpl implements VibeHistoryFactoryMethods {
    public fromJsonString(input: string): VibeHistoryModel | null {
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

    public fromCodexHistory(input: string): VibeHistoryModel | null {
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

        if (chatList.length === 0) {
            return null;
        }

        const content = VibeHistoryContentSchema.parse({
            ide_name: 'codex',
            chat_list: chatList,
        });

        return new VibeHistoryModel(content);
    }

    public fromCursorHistory(input: string): VibeHistoryModel | null {
        // 依据 '\n---\n' 分割文件成 sections
        const sections = input.split('\n---\n').filter(section => section.trim().length > 0);
        const chatList: SingleChatType[] = [];

        for (const section of sections) {
            const lines = section.split('\n').filter(line => line.trim().length > 0);

            if (lines.length === 0) {
                continue;
            }

            // 检查第一行是否是 '**User**' 或 '**Cursor**'
            const firstLine = lines[0].trim();
            let role: 'user' | 'assistant' | undefined;
            let name = '';

            if (firstLine === '**User**') {
                role = 'user';
                name = 'user';
            } else if (firstLine === '**Cursor**') {
                role = 'assistant';
                name = 'assistant';
            } else {
                // 如果不是以指定的头部开头，跳过这个section
                continue;
            }

            // 提取内容（去掉头部后的所有行）
            const contentLines = lines.slice(1);
            const content = contentLines.join('\n').trim();

            if (content.length > 0) {
                const singleChat = SingleChatSchema.parse({
                    role: role,
                    name: name,
                    content: content,
                    is_select: true,
                });
                chatList.push(singleChat);
            }
        }

        if (chatList.length === 0) {
            return null;
        }

        const content = VibeHistoryContentSchema.parse({
            ide_name: 'cursor',
            chat_list: chatList,
        });

        return new VibeHistoryModel(content);
    }

    public fromFileText(input: string): VibeHistoryModel | null {
        try {
            let cursorModel = this.fromCursorHistory(input);
            if (cursorModel) {
                return cursorModel;
            }
        } catch (error) {
            // ignore
        }

        try {
            let codexModel = this.fromCodexHistory(input);
            if (codexModel) {
                return codexModel;
            }
        } catch (error) {
            // ignore
        }

        return this.fromJsonString(input);
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

        const extraContentParts: string[] = [];
        const contentParts: string[] = [];
        switch (role) {
            case 'user':
                {
                    if (!Array.isArray(payload.content)) {
                        return null;
                    }
                    for (const item of payload.content) {
                        if (item.type === 'input_text') {
                            const text = item.text;
                            const lines = text.split('\n');
                            const requestIndex = lines.findIndex((line: string) => line.trim() === '## My request for Codex:');

                            if (requestIndex !== -1) {
                                // 如果找到 "## My request for Codex:" 行
                                const extraLines = lines.slice(0, requestIndex);
                                const contentLines = lines.slice(requestIndex + 1);

                                if (extraLines.length > 0) {
                                    extraContentParts.push(extraLines.join('\n'));
                                }
                                if (contentLines.length > 0) {
                                    contentParts.push(contentLines.join('\n'));
                                }
                            } else {
                                // 如果没找到，所有内容都放到 extraContentParts
                                extraContentParts.push(text);
                            }
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

        const extraContent = extraContentParts.join('\n');
        const content = contentParts.join('\n');

        if (contentParts.length > 0) {
            return SingleChatSchema.parse({
                role: role,
                name: codexModel,
                extra_content: extraContent,
                content: content,
                is_select: true,
            });
        } else {
            return SingleChatSchema.parse({
                role: role,
                name: codexModel,
                content: extraContent,
                is_select: true,
            });
        }
    }
}

// 导出默认实例，方便使用
export const VibeHistoryFactory = new VibeHistoryFactoryImpl();