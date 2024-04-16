import axios from 'axios';
import imageSize from 'image-size';

async function getFileSizeByUrl(url: string): Promise<number> {
    try {
        const response = await axios.head(url);
        const contentLength = response.headers['content-length'];
        if (typeof contentLength === 'string') {
            return parseInt(contentLength);
        } else {
            throw new Error('Content-Length header is missing or not a string');
        }
    } catch (error) {
        if (error instanceof Error)
        throw new Error(`Failed to get file size: ${error.message}`);
    throw new Error('Failed to get file size');
    }
}

async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const dimensions = imageSize(Buffer.from(response.data));
        return {
            width: dimensions.width || 0,
            height: dimensions.height || 0
        };
    } catch (error) {
        if (error instanceof Error)

        throw new Error(`Failed to get image dimensions: ${error.message}`);
    throw new Error('Failed to get image dimensions');
    }
}
async function getVideoDimensions(url: string): Promise<{ width: number; height: number }> {
    return {
        width: 0,
        height: 0
    }
}

export { getFileSizeByUrl , getImageDimensions,getVideoDimensions};