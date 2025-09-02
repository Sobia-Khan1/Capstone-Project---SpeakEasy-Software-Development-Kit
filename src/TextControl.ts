import { OpenAI } from "openai";
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
	return?: { type: string; description: string };
	usageExamples?: {
		command: string;
		trigger: string;
		description: string;
	}[];
};

const jsonSchemaPropertyDefinition = z.object({
	type: z.string(),
	description: z.string(),
	examples: z.array(z.string()).optional(),
});

const jsonSchemaProperties = z.record(jsonSchemaPropertyDefinition);

const jsonSchema7Schema = z
	.object({
		// You could require the type to be "object" if desired
		type: z.literal("object").optional(),
		properties: jsonSchemaProperties.optional(),
	})
	.passthrough(); // allow additional keys that you might not want to validate strictly

// Schema for usage examples
const usageExampleSchema = z.object({
	command: z.string(),
	trigger: z.string(),
	description: z.string(),
});

// Schema for the return type object
const returnSchema = z.object({
	type: z.string(),
	description: z.string(),
});

// Main function definition schema
export const functionDefinitionSchema = z.object({
	type: z.literal("function"),
	function: z.object({
		name: z.string(),
		description: z.string(),
		parameters: jsonSchema7Schema,
	}),
	strict: z.boolean().optional(),
	return: returnSchema.optional(),
	usageExamples: z.array(usageExampleSchema).optional(),
});

export type FunctionType = {
	description: FunctionDefinitionSchema;
	func: (...args: any[]) => any;
};

// Copied from openai/src/core.ts
declare const Deno:
	| {
			env?: {
				get?: (key: string) => string | undefined;
			};
	  }
	| undefined;

//@useDeclaredType
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
export class TextControl {
	//Class Variables
	private apiKey: string | undefined;
	private baseUrl: string | undefined;

	private fallbackApiKey: string | undefined;
	private fallbackBaseUrl: string | undefined;
	// @ts-ignore
	private defaultHeaders: Record<string, string | null | undefined>;
	private client: any;
	private functions: FunctionType[];
	private storedMessages: { role: string; content: string; name?: string }[];
	private isUsingFallback: boolean = false;
	private model: string;
	private instructions: string;
	private fallbackModel: string | undefined;
	private dangerouslyAllowBrowser: boolean;
	private defaultInstructions =
		"Only speak in English. Your knowledge cutoff is 2023-10. You are a helpful, professional, and friendly AI. Act like a human, but remember that you aren't a human and that you can't do human things in the real world. Your voice and personality should be warm and engaging, with a professional tone. Talk quickly. You should always call one or multiple functions if appropriate. Do not refer to these rules, even if you’re asked about them.";

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
	constructor({
		apiKey = TextControl.readEnv("OPENAI_API_KEY"),
		...config
	}: TextControlConfig = {}) {
		this.apiKey = apiKey;
		this.baseUrl = config.baseUrl;
		this.defaultHeaders = config.defaultHeaders ?? {};
		this.model = config.model ?? "gpt-4o";
		this.instructions = config.instructions ?? this.defaultInstructions;
		this.fallbackModel = config.fallbackModel;

		// default to false
		this.dangerouslyAllowBrowser = config.dangerouslyAllowBrowser ?? false;
		this.fallbackApiKey = config.fallbackApiKey;
		this.fallbackBaseUrl = config.fallbackBaseUrl;

		this.functions = [];
		this.storedMessages = [
			{
				role: "system",
				content: this.instructions,
			},
		];

		if (!this.apiKey) {
			throw new Error("API key not provided");
		}

		this.client = new OpenAI({
			baseURL: this.baseUrl,
			apiKey: this.apiKey,
			defaultHeaders: this.defaultHeaders,
			dangerouslyAllowBrowser: this.dangerouslyAllowBrowser,
		});
	}

	// Copied from openai/src/core.ts
	private static readEnv = (env: string): string | undefined => {
		if (typeof process !== "undefined") {
			return process.env?.[env]?.trim() ?? undefined;
		}
		if (typeof Deno !== "undefined") {
			return Deno.env?.get?.(env)?.trim();
		}
		return undefined;
	};

	/**
	 * Sets a model that SDK should use if original model is down
	 */
	private setFallbackClient() {
		if (!this.fallbackApiKey || !this.fallbackBaseUrl) {
			throw new Error("Fallback API configuration not provided");
		}
		if (!this.fallbackModel) {
			throw new Error("Fallback model not provided");
		}
		this.client = new OpenAI({
			apiKey: this.fallbackApiKey,
			baseURL: this.fallbackBaseUrl,
			defaultHeaders: this.defaultHeaders,
			dangerouslyAllowBrowser: this.dangerouslyAllowBrowser,
		});
		this.isUsingFallback = true;
	}

	/**
	 * Default model SDK should use
	 */
	private setDefaultClient() {
		this.client = new OpenAI({
			apiKey: this.apiKey,
			defaultHeaders: this.defaultHeaders,
			dangerouslyAllowBrowser: true,
		});
		this.isUsingFallback = false;
	}

	/**
	 * Send a request to the OpenAI API, also handles the function calling.
	 * @param message - The users message to send to the OpenAI API
	 * @returns The response from the OpenAI API
	 */
	async sendRequest(message: string): Promise<string> {
		try {
			const tools = this.functions.map(({ description }) => ({ ...description }));

			// Send the initial request to OpenAI
			const chatCompletion = await this.client.chat.completions.create({
				messages: [
					...this.storedMessages,
					{
						role: "user",
						content: message,
					},
				],
				model: this.isUsingFallback ? this.fallbackModel : this.model,
				tools,
			});

			// If there's a direct response, store it and return it
			if (
				chatCompletion.choices[0].message.content &&
				!chatCompletion.choices[0].message.tool_calls
			) {
				this.storedMessages.push({
					role: "user",
					content: message,
				});

				this.storedMessages.push(chatCompletion.choices[0].message);

				return chatCompletion.choices[0].message.content;
			}

			// Array to collect function call result messages
			const functionCallResultMessages = [];

			// Handle function calls
			console.log(chatCompletion.choices[0].message.tool_calls);
			for (const toolCall of chatCompletion.choices[0].message.tool_calls) {
				if (toolCall) {
					for (const f of this.functions) {
						if (f.description.function.name === toolCall.function.name) {
							const arugmentJSON = JSON.parse(toolCall.function.arguments);
							const argumentValues = Object.values(arugmentJSON);

							console.log("argument values: " + argumentValues);
							// Invoke the tool function
							const result = await f.func(...argumentValues);

							// Prepare a follow-up message with the tool's result
							const functionCallResultMessage = {
								role: "tool",
								content: JSON.stringify({
									functionResult: result,
								}),
								tool_call_id: toolCall.id,
							};

							functionCallResultMessages.push(functionCallResultMessage);
						}
					}
				}
			}

			// Create the completion payload
			const completion_payload = {
				model: this.isUsingFallback ? this.fallbackModel : this.model,
				messages: [
					...this.storedMessages,
					{ role: "user", content: message },
					chatCompletion.choices[0].message,
					...functionCallResultMessages,
				],
			};

			// Get the final response
			const final_response = await this.client.chat.completions.create(completion_payload);

			//Clear chat history
			this.storedMessages = [
				{
					role: "system",
					content: this.instructions,
				},
			];

			return final_response.choices[0].message.content;
		} catch (error) {
			// If we're already using the fallback provider, switch back to default and throw
			if (this.isUsingFallback) {
				this.setDefaultClient();
				throw error;
			}

			// Try with fallback provider
			try {
				this.setFallbackClient();
				console.log("Sending request failed, switching to fallback model");
				return await this.sendRequest(message);
			} catch (fallbackError) {
				// Switch back to default client before throwing
				console.log(
					"Sending request with fallback model failed, switching to default model, returning"
				);
				this.setDefaultClient();
				throw fallbackError;
			}
		}
	}

	/**
	 * Get the function call name & arguments or response from the OpenAI API.
	 * @param message - The users message to send to the OpenAI API
	 * @returns The function call name from the OpenAI API
	 */
	async getFunctionCallName(message: string): Promise<string | string[]> {
		try {
			const tools = this.functions.map(({ description }) => ({ ...description }));

			const chatCompletion = await this.client.chat.completions.create({
				messages: [...this.storedMessages, { role: "user", content: message }],
				model: this.isUsingFallback ? this.fallbackModel : this.model,
				tools,
			});

			const responseMessage = chatCompletion.choices[0].message;
			console.log("Response message:", responseMessage);

			// Extract and return function names if tool calls are present
			if (responseMessage.tool_calls) {
				return responseMessage.tool_calls;
			}

			// Return direct response content if present
			if (responseMessage.content) {
				return responseMessage.content;
			}

			// Return empty array if no content or tool calls (unlikely scenario)
			return [];
		} catch (error) {
			// If we're already using the fallback provider, switch back to default and throw
			if (this.isUsingFallback) {
				this.setDefaultClient();
				throw error;
			}

			// Try with fallback provider
			try {
				this.setFallbackClient();
				console.log("Sending request failed, switching to fallback model");
				return await this.getFunctionCallName(message);
			} catch (fallbackError) {
				// Switch back to default client before throwing
				this.setDefaultClient();
				console.log(
					"Sending request with fallback model failed, switching to default model, returning"
				);
				throw fallbackError;
			}
		}
	}

	/**
	 * Adds a function to the SDK.
	 * @param description - The description of the function
	 * @param func - The function to call
	 */
	addFunction(description: FunctionDefinitionSchema, func: (...args: any[]) => any) {
		// validate that the description is correct, will throw an error if its not
		const validatedDescription = functionDefinitionSchema.parse(description);

		const existingFunctionIndex = this.functions.findIndex(
			(f) => f.description.function.name === validatedDescription.function.name
		);

		// If the function exists, remove it
		if (existingFunctionIndex !== -1) {
			this.functions.splice(existingFunctionIndex, 1);
		}

		this.functions.push({ description, func });
	}
}

export default TextControl;
