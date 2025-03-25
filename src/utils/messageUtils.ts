/**
 * Utilities for processing and formatting chat messages
 */

// Constants for text processing
const CODE_BLOCK_REGEX = /^```(\w+)?$/;
const LIST_ITEM_REGEX = /^(\d+)[.)] /;

interface ProcessingOptions {
    maxCodeBlockLength?: number;
    maxResponseLength?: number;
    joinBrokenSentences?: boolean;
}

/**
 * Process text for markdown formatting with various cleanup operations
 */
export function processText(text: string, options: ProcessingOptions = {}) {
    const {
        maxCodeBlockLength = 200,
        maxResponseLength = 150,
        joinBrokenSentences = true
    } = options;

    // Split text into lines for processing
    const lines = text.split('\n');
    const resultLines: string[] = [];
    
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage: string | undefined;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const codeBlockMatch = line.trim().match(CODE_BLOCK_REGEX);

        if (codeBlockMatch) {
            if (!inCodeBlock) {
                // Starting a new code block
                inCodeBlock = true;
                codeBlockLanguage = codeBlockMatch[1];
                codeBlockContent = [line];
            } else {
                // Ending current code block
                codeBlockContent.push(line);
                const processedBlock = processCodeBlock(
                    codeBlockContent.join('\n'),
                    codeBlockLanguage,
                    maxCodeBlockLength
                );
                resultLines.push(processedBlock);
                codeBlockContent = [];
                inCodeBlock = false;
            }
        } else if (inCodeBlock) {
            codeBlockContent.push(line);
        } else {
            // Process regular text
            const processedLine = processTextLine(line, i > 0 ? lines[i - 1] : '', joinBrokenSentences);
            if (processedLine) {
                if (shouldJoinWithPreviousLine(processedLine, resultLines)) {
                    const previousLine = resultLines.pop() || '';
                    resultLines.push(`${previousLine} ${processedLine}`);
                } else {
                    resultLines.push(processedLine);
                }
            }
        }
    }

    // Handle any remaining code block content
    if (inCodeBlock && codeBlockContent.length > 0) {
        const processedBlock = processCodeBlock(
            codeBlockContent.join('\n'),
            codeBlockLanguage,
            maxCodeBlockLength
        );
        resultLines.push(processedBlock);
    }

    return resultLines.join('\n');
}

/**
 * Process a code block with optional truncation
 */
function processCodeBlock(
    content: string,
    language?: string,
    maxLength?: number
): string {
    // Ensure proper spacing around code blocks
    const processedContent = content
        .replace(/```(\w+)\n/, '```$1\n\n')
        .replace(/\n```/, '\n\n```');

    if (maxLength && content.length > maxLength) {
        const truncated = content.substring(0, maxLength);
        return `${truncated}...`;
    }

    return processedContent;
}

/**
 * Process a single line of text
 */
function processTextLine(
    line: string,
    previousLine: string,
    joinBrokenSentences: boolean
): string {
    // Skip empty lines
    if (!line.trim()) return line;

    // Convert numbered lists to proper markdown
    const listMatch = line.match(LIST_ITEM_REGEX);
    if (listMatch) {
        return line.replace(LIST_ITEM_REGEX, `${listMatch[1]}. `);
    }

    // Join broken sentences if enabled
    if (joinBrokenSentences && 
        previousLine.trim().endsWith(':') && 
        !line.trim().startsWith('-') && 
        !line.trim().startsWith('*')) {
        return line.trim();
    }

    return line;
}

/**
 * Determine if the current line should be joined with the previous line
 */
function shouldJoinWithPreviousLine(
    currentLine: string,
    previousLines: string[]
): boolean {
    if (previousLines.length === 0) return false;
    
    const previousLine = previousLines[previousLines.length - 1];
    
    // Join if previous line ends with a colon
    if (previousLine.trim().endsWith(':')) return true;
    
    // Don't join if current line starts with list markers
    if (currentLine.trim().startsWith('-')) return false;
    if (currentLine.trim().startsWith('*')) return false;
    
    return false;
}

/**
 * Truncate response text to a specified length
 */
export function truncateResponse(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Format error messages for display
 */
export function formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    if (typeof error === 'string') {
        return `Error: ${error}`;
    }
    return 'An unknown error occurred';
} 