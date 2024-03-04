function rsaOaep() {
    this.textDecoder = new TextDecoder('utf-8');
}
const 
    prt = rsaOaep.prototype,
    atob = (window || self)?.atob,
    subtle = (window || self).crypto.subtle;
prt.importPrivateKey = async function (pemkey, transform = (x) => x) {
    const myprivkey = await subtle.importKey(
        "pkcs8",
        this.str2ab(atob(transform(pemkey))),
        { name: "RSA-OAEP", hash: "SHA-256"},
        false,
        ["decrypt"]
    );
    return myprivkey;
}
prt.decryptData = async function (privateKey, encryptedData, transform = (x) => x) {
    const decrypted = await subtle.decrypt(
        { name: "RSA-OAEP", hash: "SHA-256"},
        privateKey,
        this.str2ab(atob(transform(encryptedData)))
    );
    return this.textDecoder.decode(decrypted);
}
prt.str2ab = function(binaryStr) {
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
};

export default rsaOaep;