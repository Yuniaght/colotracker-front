import type {MultiPartData} from 'h3';

export type FilePart = {
    filename: string
    type?: string
    size: number
    data: Buffer
}

export async function parseMultiPartData(formData?: MultiPartData[]) {
    let body: Record<string, any> = {};

    if (!formData || formData.length === 0) {
        return body;
    }

    for (const part of formData) {
        if (part.name === undefined) {
            continue;
        }

        const value =
            part.filename != null
                ? {
                    filename: part.filename,
                    type: part.type,
                    size: part.data.length,
                    data: part.data, // reste un Buffer
                } as FilePart
                : part.data.toString("utf8");

        // Gérer doublons (checkbox, multiple files, etc.)
        if (!body[part.name]) {
            body[part.name] = part.name?.endsWith('[]') ? [value] : value;
        } else {
            if (!Array.isArray(body[part.name])) {
                body[part.name] = [body[part.name]];
            }
            body[part.name].push(value);
        }
    }

    return body;
}

export function splitBodyFiles(body: Record<string, any>, keys: string[] = []) {
    const files: FilePart[] = [];
    const newBody: Record<string, any> = {};

    for (const key in body) {
        if(keys.includes(key)) {
            if(Array.isArray(body[key])) {
                files.push(...body[key]);
            } else {
                files.push(body[key]);
            }
        } else {
            newBody[key] = body[key];
        }
    }

    return {
        files: files.filter(Boolean),
        body: newBody,
    }
}


/*
        if (body[key]) {
            if(!Array.isArray(body[key])) {
                files.push(body[key]);
            } else {
                files.push(...body[key]);
            }
        } else {
            newBody[key] = body[key];
        }
 */