// Short code generator

const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

exports.encode = (num) => {
    let result = "";

    while (num > 0) {
        result = chars[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

