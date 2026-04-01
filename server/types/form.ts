import * as z from "zod";
import type {ZodObject, ZodRawShape} from "zod";

export type AnyZodObject = ZodObject<ZodRawShape>;

export interface Form<
    Body extends AnyZodObject,
    Query extends AnyZodObject | undefined = undefined,
    Headers extends AnyZodObject | undefined = undefined> {
    schema: {
        body: Body,
        query?: Query;
        headers?: Headers;
    };
    /**
     * Keys of the files to be uploaded
     * Important to use this option when you want to upload multiple files
     */
    filesKeys?: string[];
}