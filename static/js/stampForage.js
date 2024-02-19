function cacheWithTimeStamp () {
    if(!localforage){
        throw new Error("localforage is not undefined.");
    }
    this.instance = localforage.createInstance({
        name: "git-fetch"
    })
}
const prt = cacheWithTimeStamp.prototype;
prt.clear = async function() {
    return this.instance.clear();
}
prt.getItem = async function() {
    const 
        now = Date.now(),
        result = await this.instance.getItem.call(this.instance, ...arguments);
    if(result?.expires < now){
        return this.instance.removeItem.call(this.instance, ...arguments).then(() => void(0));
    }
    return result?.data;
}
prt.setItem = async function(key, value, ttl = 15 * 60 * 1000) {
    const payload = {
        data: value,
        ttl,
        expires: Date.now() + ttl
    };
    return this.instance.setItem.call(this.instance, key, payload);
}

export {cacheWithTimeStamp as default, cacheWithTimeStamp}