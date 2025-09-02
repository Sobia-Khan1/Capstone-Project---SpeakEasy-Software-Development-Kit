import { JSONSchema7 } from "json-schema";
import { z } from "zod";
export type FunctionDefinitionSchema = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: JSONSchema7;
    };
    strict?: boolean;
    return?: {
        type: string;
        description: string;
    };
    usageExamples?: {
        command: string;
        trigger: string;
        description: string;
    }[];
};
export declare const functionDefinitionSchema: z.ZodObject<{
    type: z.ZodLiteral<"function">;
    function: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodObject<{
            type: z.ZodOptional<z.ZodLiteral<"object">>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                type: z.ZodString;
                description: z.ZodString;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }>>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodLiteral<"object">>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                type: z.ZodString;
                description: z.ZodString;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }>>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodLiteral<"object">>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                type: z.ZodString;
                description: z.ZodString;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }>>>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        parameters: {
            type?: "object" | undefined;
            properties?: Record<string, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }> | undefined;
        } & {
            [k: string]: unknown;
        };
    }, {
        description: string;
        name: string;
        parameters: {
            type?: "object" | undefined;
            properties?: Record<string, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }> | undefined;
        } & {
            [k: string]: unknown;
        };
    }>;
    strict: z.ZodOptional<z.ZodBoolean>;
    return: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        description: string;
    }, {
        type: string;
        description: string;
    }>>;
    usageExamples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        trigger: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        command: string;
        trigger: string;
    }, {
        description: string;
        command: string;
        trigger: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    function: {
        description: string;
        name: string;
        parameters: {
            type?: "object" | undefined;
            properties?: Record<string, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }> | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    type: "function";
    strict?: boolean | undefined;
    return?: {
        type: string;
        description: string;
    } | undefined;
    usageExamples?: {
        description: string;
        command: string;
        trigger: string;
    }[] | undefined;
}, {
    function: {
        description: string;
        name: string;
        parameters: {
            type?: "object" | undefined;
            properties?: Record<string, {
                type: string;
                description: string;
                examples?: string[] | undefined;
            }> | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    type: "function";
    strict?: boolean | undefined;
    return?: {
        type: string;
        description: string;
    } | undefined;
    usageExamples?: {
        description: string;
        command: string;
        trigger: string;
    }[] | undefined;
}>;
export type FunctionType = {
    description: FunctionDefinitionSchema;
    func: (...args: any[]) => any;
};
/**
 * @typeParam apiKey - Defaults to process.env.OPENAI_API_KEY
 * @typeParam baseUrl - Override the default base URL for the API
 * @typeParam defaultHeaders - Default headers to include with every request to the API.
 * @typeParam model - ID of the model to use. Defaults to "gpt-4o".
 * @typeParam instructions - Optional instructions to initialize the model.
 * @typeParam fallbackApiKey - Alternative API key to use if the primary service fails (e.g., Anthropic API key)
 * @typeParam fallbackBaseUrl - Alternative base URL to use if the primary service fails (e.g., https://api.anthropic.com/v1/)
 * @typeParam fallbackModel - ID of the model to use with the fallback service (e.g., claude-3-haiku-20240307)
 * @typeParam dangerouslyAllowBrowser - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
 */
export type TextControlConfig = {
    apiKey?: string;
    dangerouslyAllowBrowser?: boolean;
    model?: string;
    instructions?: string;
    baseUrl?: string;
    defaultHeaders?: Record<string, string | null | undefined>;
    fallbackApiKey?: string;
    fallbackBaseUrl?: string;
    fallbackModel?: string;
};
/**
 * This class handles various API calls to OpenAI services and interactions with OpenAI's
 * chat completions. It also allows the management of custom functions that can be
 * invoked during chat interactions.
 */
export declare class TextControl {
    private apiKey;
    private baseUrl;
    private fallbackApiKey;
    private fallbackBaseUrl;
    private defaultHeaders;
    private client;
    private functions;
    private storedMessages;
    private isUsingFallback;
    private model;
    private instructions;
    private fallbackModel;
    private dangerouslyAllowBrowser;
    private defaultInstructions;
    /**
     * API Client for integrating text instructions and function calls using OpenAI API
     * @param config - custom variable of type TextControlConfig to pass in the following information
     * @param config.apiKey - Defaults to process.env.OPENAI_API_KEY
     * @param config.baseUrl - Override the default base URL for the API
     * @param config.defaultHeaders - Default headers to include with every request to the API.
     * @param config.model - ID of the model to use. Defaults to "gpt-4o".
     * @param config.instructions - Optional instructions to initialize the model.
     * @param config.fallbackApiKey - Alternative API key to use if the primary service fails (e.g., Anthropic API key)
     * @param config.fallbackBaseUrl - Alternative base URL to use if the primary service fails (e.g., https://api.anthropic.com/v1/)
     * @param config.fallbackModel - ID of the model to use with the fallback service (e.g., claude-3-haiku-20240307)
     * @param config.dangerouslyAllowBrowser - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ apiKey, ...config }?: TextControlConfig);
    private static readEnv;
    /**
     * Sets a model that SDK should use if original model is down
     */
    private setFallbackClient;
    /**
     * Default model SDK should use
     */
    private setDefaultClient;
    /**
     * Send a request to the OpenAI API, also handles the function calling.
     * @param message - The users message to send to the OpenAI API
     * @returns The response from the OpenAI API
     */
    sendRequest(message: string): Promise<string>;
    /**
     * Get the function call name & arguments or response from the OpenAI API.
     * @param message - The users message to send to the OpenAI API
     * @returns The function call name from the OpenAI API
     */
    getFunctionCallName(message: string): Promise<string | string[]>;
    /**
     * Adds a function to the SDK.
     * @param description - The description of the function
     * @param func - The function to call
     */
    addFunction(description: FunctionDefinitionSchema, func: (...args: any[]) => any): void;
}
export default TextControl;
//# sourceMappingURL=TextControl.d.ts.map