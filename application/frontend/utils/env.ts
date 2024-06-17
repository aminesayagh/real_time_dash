import { z } from 'zod';

const emvVariables = z.object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    SECRET: z.string(),
    NEXT_AUTH_URL: z.string(),   
    MONGODB_URI: z.string(),
});

export type TEnvVariables = z.infer<typeof emvVariables>;

declare global {
    namespace NodeJS {
        interface ProcessEnv extends TEnvVariables {
            
        }
    }
}

const myEnvVariables = emvVariables.parse(process.env);
if (myEnvVariables instanceof Error) throw myEnvVariables;

export const GOOGLE_CLIENT_ID = myEnvVariables.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = myEnvVariables.GOOGLE_CLIENT_SECRET;
export const GITHUB_CLIENT_ID = myEnvVariables.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = myEnvVariables.GITHUB_CLIENT_SECRET;
export const SECRET = myEnvVariables.SECRET;
export const NEXT_AUTH_URL = myEnvVariables.NEXT_AUTH_URL;
export const MONGODB_URI = myEnvVariables.MONGODB_URI;