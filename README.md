# @haitai-social/pit-history-utils

[![NPM Version](https://badge.fury.io/js/%40haitai-social%2Fpit-history-utils.svg)](https://badge.fury.io/js/%40haitai-social%2Fpit-history-utils)
[![Node Version](https://img.shields.io/node/v/@haitai-social/pit-history-utils)](https://www.npmjs.com/package/@haitai-social/pit-history-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript utility library for managing and exporting Haitai Community IDE history snippets.

## Features

- 🔧 **Fully Typed**: Based on TypeScript, providing complete type definitions
- 📦 **Data Validation**: Uses Zod for strict data validation
- 🔄 **Version Management**: Supports version compatibility for historical data
- 🎯 **Selection Management**: Supports selecting/deselecting chat records
- ✏️ **Content Editing**: Supports editing chat names and IDE names
- ➕ **History Append**: Supports adding new chat history records
- 📤 **Data Export**: Supports exporting selected chat history in standard format

## Installation

```bash
npm install @haitai-social/pit-history-utils
```

or using yarn:

```bash
yarn add @haitai-social/pit-history-utils
```

## Quick Start

### Basic Usage

```typescript
import { VibeHistoryModel } from '@haitai-social/pit-history-utils';

// Create history model from JSON string
const jsonData = `{
  "ide_name": "My IDE",
  "chat_list": [
    {
      "role": "user",
      "name": "User",
      "content": "Hello",
      "is_select": true
    },
    {
      "role": "assistant",
      "name": "Assistant",
      "content": "Hello! How can I help you?",
      "is_select": true
    }
  ]
}`;

const history = VibeHistoryModel.fromJson(jsonData);

// Edit IDE name
history.editIdeName("My IDE");

// Unselect the first chat
history.unselectChatAtIndex(0);

// Edit chat name
history.editNameAtIndex(1, "AI Assistant");

// Add new chat record
history.appendChatHistory({
  role: "user",
  name: "User",
  content: "Thanks for your help!",
  is_select: true
});

// Export selected chat history
const exportedData = history.toJSON();
console.log(JSON.stringify(exportedData, null, 2));
```

### Handling Versioned Data

```typescript
// Handle v1 version data
const v1JsonData = `{
  "version": "v1",
  "content": {
    "ide_name": "My IDE",
    "chat_list": [
      {
        "role": "user",
        "name": "User",
        "content": "Hello"
      }
    ]
  }
}`;

const history = VibeHistoryModel.fromJson(v1JsonData);
```

## API Documentation

### VibeHistoryModel

The main history management class.

#### Static Methods

##### `fromJson(input: string): VibeHistoryModel`
Parses JSON string and creates a history model instance.

**Parameters:**
- `input: string` - JSON formatted history data string

**Returns:** `VibeHistoryModel` instance

**Throws:**
- `SyntaxError` - When JSON parsing fails
- `Error` - When data structure is incorrect

#### Instance Methods

##### `unselectChatAtIndex(index: number): void`
Deselects the chat record at the specified index.

##### `selectChatAtIndex(index: number): void`
Selects the chat record at the specified index.

##### `editNameAtIndex(index: number, newName: string): void`
Edits the name of the chat record at the specified index.

##### `editIdeName(newName: string): void`
Edits the IDE name.

##### `appendChatHistory(chat: SingleChatType): void`
Adds a new chat record to the end of the history list.

##### `toJSON(): ExportedVibeHistoryV1JsonType`
Exports selected chat history as v1 format JSON data.

**Returns:** Exported history data containing version info and filtered chat list

## Type Definitions

### SingleChatType
Type definition for a single chat record:

```typescript
type SingleChatType = {
  role: string;      // Role (e.g. "user", "assistant")
  name: string;      // Chat name
  content: string;   // Chat content
  is_select: boolean; // Whether selected (for internal use only)
}
```

### VibeHistoryContentType
Main structure for history content:

```typescript
type VibeHistoryContentType = {
  ide_name: string;           // IDE name
  chat_list: SingleChatType[]; // Chat record list
}
```

### ExportedVibeHistoryV1JsonType
Exported v1 version JSON data format:

```typescript
type ExportedVibeHistoryV1JsonType = {
  version: "v1";
  content: {
    ide_name: string;
    chat_list: ExportedSingleChatType[];
  };
}
```

## Data Validation

This library uses [Zod](https://zod.dev/) for strict data validation, ensuring:

- All required fields are present
- Data types are correct
- String fields are non-empty (when appropriate)
- Array structures are correct

## Error Handling

The library throws the following types of errors:

- `TypeError` - When parameter types are incorrect
- `RangeError` - When index is out of range
- `SyntaxError` - When JSON parsing fails
- `Error` - When data structure doesn't match expectations

## Development

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Related Projects

- [Haitai Community IDE](https://github.com/haitai-social/community-ide)
- [Model Context Protocol](https://github.com/modelcontextprotocol)

## Contributing

Issues and Pull Requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**haitai-social** - [GitHub](https://github.com/haitai-social)

## Support

If you encounter any issues while using this library:

1. Check the [Issues](https://github.com/haitai-social/pit-history-utils-typescript/issues) page
2. Create a new Issue describing your problem
3. Provide relevant code examples and error information
