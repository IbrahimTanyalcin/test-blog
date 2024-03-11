import rsaOaep from "./rsa-oaep.js";
import CssToggler from "./css-toggler.js";
function hashRender ({aref, cache, values}) {
    const that = this;
    this.root = "https://api.github.com/repos/IbrahimTanyalcin/test-blog/contents/static/md/";
    this.values = values;
    this.aref = aref;
    this.cache = cache;
    this.token = ``;
    this.decrypt = false;
    this.decryptBusy = false;
    this.rsaOaep = null;
    this.cssToggler = new CssToggler({values});
    this.meta = d => d?.name === "meta.json";
    this.textDecoder = new TextDecoder('utf-8');
    (window || self).addEventListener("hashchange", function(){
        try {
            const hash = that.currentHash;
            if(values.docEl.querySelector(`:is(#${hash}, [name=${hash}])`)){
                return
            } else {throw "Do routing"}
        } catch {
            that.renderDataFromHash();
        }
    })
}
const 
    prt = hashRender.prototype,
    atob = (window || self)?.atob,
    trimWs = (s) => s.replace(/\s*/g,""),
    trimHeader = (s) => s.replace(/-----(?:BEGIN|END) PRIVATE KEY-----/gi, ""),
    privKeyPH = `
        -----BEGIN PRIVATE KEY-----
        ..........
        ..........
        -----END PRIVATE KEY-----
    `.replace(/^\s*/gim, "");
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
prt.atou = function(payload) {
    return this.textDecoder.decode(
        Uint8Array.from(atob(payload), d => d.charCodeAt(0))
    )
}
prt.decryptPAT = async function(msg) {
    try {
        if(!this.decrypt || !this.token){return}
        const that = this;
        await ch.until(() => Swal).lastOp;
        await ch.until(() => !that.decryptBusy).lastOp;
        this.decryptBusy = true;
        this.rsaOaep = this.rsaOaep || new rsaOaep();
        this.enableDragNDrop();
        const result = await Swal.fire({
            icon: "warning",
            title: "Authorized Content",
            input: "textarea",
            inputLabel: msg || "Insert or drag&drop your private key",
            inputPlaceholder: privKeyPH,
            inputAttributes: {
                "aria-label": "Your privkey here..."
            },
            showCancelButton:false,
            showCloseButton: false,
            showDenyButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });
        if(!result.isConfirmed || /^\s*$/.test(result.value)){
            this.decryptBusy = false;
            return this.decryptPAT("You have not provided any key");
        }
        const privKey = await this.rsaOaep.importPrivateKey(result.value, (s) => trimWs(trimHeader(s)));
        this.token = await this.rsaOaep.decryptData(privKey, this.token, trimWs);
        /* console.log("token is:", this.token); */
        this.decryptBusy = false;
        this.decrypt = false;
    } catch (err) {
        this.decryptBusy = false;
        return this.decryptPAT(err.message)
    }
}
prt.decryptDecodedContent = async function(content, msg) {
    try {
        const that = this;
        await ch.until(() => Swal).lastOp;
        await ch.until(() => !that.decryptBusy).lastOp;
        this.decryptBusy = true;
        this.rsaOaep = this.rsaOaep || new rsaOaep();
        this.enableDragNDrop();
        const result = await Swal.fire({
            icon: "warning",
            title: "Authorized Content",
            input: "textarea",
            inputLabel: msg || "Insert or drag&drop your private key",
            inputPlaceholder: privKeyPH,
            inputAttributes: {
                "aria-label": "Your privkey here..."
            }
        });
        if(result.isDismissed) {
            this.decryptBusy = false;
            return new Error("Abort rendering.")
        } else if (/^\s*$/.test(result.value)){
            this.decryptBusy = false;
            return this.decryptDecodedContent(content, "You have not provided any key");
        }
        const privKey = await this.rsaOaep.importPrivateKey(result.value, (s) => trimWs(trimHeader(s)));
        const decryptedContent = await this.rsaOaep.decryptData(privKey, content, trimWs);
        this.decryptBusy = false;
        return decryptedContent;
    } catch (err) {
        this.decryptBusy = false;
        return this.decryptDecodedContent(content, err.message)
    }
}
prt.enableDragNDrop = async function() {
    const tArea = await ch.until(() => document.querySelector(".swal2-container textarea")).lastOp;
    tArea.addEventListener("drop", function(e){
        e.preventDefault();
        const 
            dT = e.dataTransfer,
            file = dT?.items?.filter?.(d => d.kind === "file").map(file => file.getAsFile())[0]
                ?? dT?.files[0],
            reader = new FileReader();
        reader.onload = function(e){
            dT?.items?.clear?.();
            dT?.clearData?.();
            tArea.value = this.result;
        };
        reader.onerror = function(err){
            throw(err?.message || err?.error?.message);
        };
        reader.readAsText(file,"UTF-8");
    })
}
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
        return JSON.parse(this.atou(content.content));
    }
    try {
        response = await fetch(href, {
            headers: {...(this.token ? {Authorization: `Bearer ${this.token}`} : {})}
        }).catch((err) => {throw new Error("Could not get metadata")});
        if (!response.ok){throw new Error("Could not get metadata")}
        content = await response.json();
        await this.cache.setItem(hash, content);
        return JSON.parse(this.atou(content.content));
    } catch {
        await this.cache.setItem(hash, {content: 'e30='});
        return {};
    }
}
prt.renderDataFromHash = async function() {
    if(this.decrypt && this.token){
        await this.decryptPAT();
    }
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
                let decodedContent = this.atou(data.content),
                    initialHash = this.currentHash;
                decodedContent = this.values.meta[data.name]?.decrypt
                    ? await this.decryptDecodedContent(decodedContent)
                    : decodedContent;
                if (decodedContent instanceof Error || initialHash !== this.currentHash) {return}
                this.cssToggler.toggle(this.values.meta[data.name]?.css, 1);
                ch(this.values.textContainerOne)
                .animate(
                    [{opacity: 1}],
                    {duration: 250, ease: "ease-in-out", fill: "both"}
                )
                switch(this.values.meta[data.name]?.mode) {
                    case "src":
                        this.values.textContainerOne.replaceChildren();
                        ch(ch.script)`>> textContent ${decodedContent} +< ${this.values.textContainerOne}`;
                        break;
                    case "xml":
                        this.values.textContainerOne.innerHTML = decodedContent;
                        break;
                    case "txt":
                        this.values.textContainerOne.replaceChildren();
                        ch(ch[`pre{
                            "style":[["white-space", "pre-wrap"]]
                        }`])`>> textContent ${decodedContent} +< ${this.values.textContainerOne}`;
                        break;
                    default:
                        this.values.textContainerOne.innerHTML = marked.parse(decodedContent);
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