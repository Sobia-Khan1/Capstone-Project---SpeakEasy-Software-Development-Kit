import { FunctionDefinitionSchema } from "./TextControl.js";
/**
 * @typeParam instructions - Instructions for the voice control
 * @typeParam initialContext - Intial context to add a system prompt to the conversation.
 * @typeParam serverPort - Port of the server that is running the voice control.
 */
export type VoiceControlConfig = {
    instructions?: string;
    initialContext?: string;
    serverPort?: number;
};
export declare class VoiceControl {
    private peerConnection;
    private dataChannel;
    private audioStream;
    private instructions;
    private context;
    private serverPort;
    private defaultInstructions;
    private functions;
    /**
     * API Client for integrating voice instructions and function calls using OpenAI Realtime API
     * @param config - custom variable of type VoiceControlConfig to pass in the following information
     * @param config.instructions - Instructions for the voice control
     * @param config.initialContext - Intial context to add a system prompt to the conversation.
     * @param config.serverPort - Port of the server that is running the voice control.
     */
    constructor(config?: VoiceControlConfig);
    /**
     * Set the context of your application for the model
     * @param context - The information the model should know about the application
     */
    setContext(context: string): void;
    /**
     * Function registry for dynamically adding function handlers
     */
    private functionRegistry;
    private transcriptionHandler;
    /**
     * Registers a transcription handler to process real-time transcriptions.
     * @param handler Function to handle transcriptions.
     */
    registerTranscriptionHandler(handler: (transcript: string) => void): void;
    /**
     * Adds a function definition to be used in Realtime API
     * @param description Function metadata
     * @param func The actual function implementation
     */
    addFunction(description: FunctionDefinitionSchema, func: (...args: any[]) => any): void;
    /**
     * Initializes WebRTC peer connection with OpenAI Realtime API.
     */
    setupPeerConnection(): Promise<void>;
    /**
     * Updates the context of your application for the model
     * @param context - The information about your application the needs to be updated
     */
    updateContext(context: string): void;
    /**
     * Configures function calling for OpenAI.
     */
    configureData(): void;
    /**
     * Handles real-time transcriptions from OpenAI.
     * @param transcript - The transcript received.
     */
    handleTranscription(transcript: string): void;
    /**
     * Handles function calls received from OpenAI.
     * @param event - The function call event data.
     */
    handleFunctionCall(event: any): Promise<void>;
    /**
     * Stops recording and closes WebRTC session.
     */
    stopRecording: () => void;
}
export default VoiceControl;
//# sourceMappingURL=VoiceControl.d.ts.map