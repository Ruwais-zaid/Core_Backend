

//* Image Validator
export const validateImage = (size, mime) => {
    if (bytesToMb(size) > 10) {
        return "Image size must be less than 10MB";
    } else if (!supportedMimes().includes(mime)) {
        return "Image must be of type: png, jpg, jpeg, svg, webp, or gif";
    }
    return null;
};

//* Convert Bytes to MB
export const bytesToMb = (bytes) => {
    return bytes / (1024 * 1024);
};

//* Supported MIME Types
export const supportedMimes = () => {
    return [
        "image/jpg",
        "image/png",
        "image/jpeg",
        "image/svg",
        "image/webp",
        "image/gif"
    ];
};
