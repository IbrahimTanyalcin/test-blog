function hashRender ({aref, cache, values}) {
    const that = this;
    this.root = "https://api.github.com/repos/IbrahimTanyalcin/test-blog/contents/static/md/";
    this.values = values;
    this.aref = aref;
    this.cache = cache;
    this.token = "";
    this.meta = d => d?.name === "meta.json";
    (window || self).addEventListener("hashchange", function(){
        that.renderDataFromHash();
    })
}
const 
    prt = hashRender.prototype,
    atob = (window || self)?.atob;
Object.defineProperties(
    prt,
    {
        currentHash: {
            get: function() {
                return window?.location?.hash?.replace(/^#\/?/,"");
            }
        },
        route: {
            get: function() {
                return this.root + this.currentHash;
            }
        }
    }
)
prt.getDataFromHash = async function(_hash) {
    /* force refresh */
    /* await this.cache.clear(); */
    let hash = _hash || this.currentHash,
        content = await this.cache.getItem(hash);
    if (!content) {
        /* Not using cache */
        content = await fetch(this.route, {
            headers: {...(this.token ? {Authorization: `Bearer ${this.token}`} : {})}
        }).then(res => res.json());
        await this.cache.setItem(hash, content, this.values?.meta?.[hash.split("/").pop()]?.ttl);
    }
   return content;
}
prt.getMetaDataFromHref = async function (uri) {
    let href = uri?.href;
    if (!href) {return void(0)}
    let hash = href.slice(this.root.length).replace(/\/?$/, ""),
        response,
        content = await this.cache.getItem(hash);
    if (content) {
       /*  serving from cache */
        return JSON.parse(atob(content.content));
    }
    try {
        response = await fetch(href, {
            headers: {...(this.token ? {Authorization: `Bearer ${this.token}`} : {})}
        }).catch((err) => {throw new Error("Could not get metadata")});
        if (!response.ok){throw new Error("Could not get metadata")}
        content = await response.json();
        await this.cache.setItem(hash, content);
        return JSON.parse(atob(content.content));
    } catch {
        await this.cache.setItem(hash, {content: 'e30='});
        return {};
    }
}
prt.renderDataFromHash = async function() {
    let data = await this.getDataFromHash();
    switch (true) {
        case data instanceof Array:
            data = data.filter(d => !this.meta(d));
            this.values.meta = await this.getMetaDataFromHref(
                new URL(`${this.route.replace(/\/?$/, "")}/meta.json`)
            ) || {};
            let arefModified = false;
            data.forEach((datum, i) => {
                if (!this.aref.some(d => d?.path === datum?.path)) {
                    arefModified = true;
                    this.aref.push(datum);
                }
            })
            /* go in the apposite direction of splice (when aref[i] =null is called)
            because array length changes. The same goes for data instanceof Object too. */
            for (let l = this.aref.length, i = l - 1; i >= 0; --i) {
                if (!data.some(datum => datum?.path === this.aref[i]?.path)) {
                    arefModified = true;
                    this.aref[i] = null;
                }
            }
            if (!arefModified){
                this.values.callbackRender({}); 
            }
            return data;
        case (data instanceof Object && !this.meta(data)):
            if (data.path === void(0)){return}
            this.values.textContainerOne._contentReady = false;
            if (!Object.values(this.values?.meta ?? {}).includes?.(data.name)) {
                this.values.meta = await this.getMetaDataFromHref(new URL("./meta.json", this.route)) || {};
            }
            for (let l = this.aref.length, i = l - 1; i >= 0; --i) {
                if(this.aref[i].path !== data.path){
                    this.aref[i] = null;
                }
            }
            if (this.aref.length) {
                Object.assign(this.aref[0], data);
                this.aref.length = 1;
                //refresh trigger because I am not changing the reference
                this.values.callbackRender({}); 
            } else {
                this.aref.push(data);
            }
            if (data.type === "file"){
                await ch.until(() => {
                    return this.values.textContainerOne._contentReady
                }).lastOp;
                ch(this.values.textContainerOne)
                .animate(
                    [{opacity: 1}],
                    {duration: 250, ease: "ease-in-out", fill: "both"}
                )
                switch(this.values.meta[data.name]?.mode) {
                    case "src":
                        this.values.textContainerOne.replaceChildren();
                        ch(ch.script)`>> textContent ${atob(data.content)} +< ${this.values.textContainerOne}`;
                        break;
                    case "xml":
                        this.values.textContainerOne.innerHTML = atob(data.content);
                        break;
                    case "txt":
                        this.values.textContainerOne.replaceChildren();
                        ch(ch[`pre{
                            "style":[["white-space", "pre-wrap"]]
                        }`])`>> textContent ${atob(data.content)} +< ${this.values.textContainerOne}`;
                        break;
                    default:
                        this.values.textContainerOne.innerHTML = marked.parse(atob(data.content));
                }
                Prism && Array.from(this.values.textContainerOne.querySelectorAll("code")).forEach(d => {
                    Prism.highlightElement(d);
                })
            }
            return data;
        default: 
            throw new Error("Error parsing hash.")
    }
}

export {hashRender as default, hashRender}