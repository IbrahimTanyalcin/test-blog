function CssToggler({values}) {
    this.ledger = new Map();
    this.values = values;
    this.head = (document.head || document.getElementsByTagName("head")[0]) || values.head;
    this.busy = false;
}
const 
    prt = CssToggler.prototype,
    nullOrUndef = Symbol("nullOrUndef");
prt.remove = function(srcs){
    srcs = [srcs].flat(Infinity);
    srcs.forEach((src) => {
        let {el, status} = this.has(src) || {};
        if(el) {
            this.ledger.delete(src);
            el.remove();
        }
    })
}
prt.clear = function(){
    [...this.ledger.values()].forEach(({el:link}) => link.remove());
    this.ledger.clear();
}
prt.globalOff = function(exclude){
    exclude = [exclude || []].flat(Infinity);
    [...this.ledger.entries()]
    .filter(([src, obj]) => !exclude.includes(src))
    .forEach(([src, obj]) => {
        if(obj.status) {
            ch(obj.el).satr("rel", "inactive-stylesheet");
            obj.status = 0;
        }
    })
}
prt.toggle = async function(srcs, onoff){
    if((srcs ?? nullOrUndef) === nullOrUndef){
        this.globalOff();
        return [];
    }
    await ch.until(() => !this.busy);
    srcs = [srcs].flat(Infinity);
    this.busy = true;
    const results = await Promise.all(srcs.map((src, i) => (async () => {
        !i && this.globalOff(srcs);
        let obj = this.has(src) || {},
            {el,status} = obj;
        if (!el){
            el = await this.load(src);
            this.ledger.set(src, {el, status: 1});
            return el;
        }
        switch(true) {
            case !!(onoff && !status):
            case !!(onoff ?? !status):
                ch(el).satr("rel", "stylesheet");
                obj.status = 1;
                break;
            case !!(!onoff && status):
            case !!(onoff ?? status):
                ch(el).satr("rel", "inactive-stylesheet");
                obj.status = 0;
                break;
            case !!(!onoff && !status):
            case !!(onoff && status):
                break;
            default:
                throw new Error("stylesheet toggle error");
        }
        return el;
    })()));
    this.busy = false;
    return results;
}
prt.load = function(src, attrs = {}){
    const link = ch.link,
          registeredEvents = new Map;
    let loadsOnEvent = false;
    ch(link)
    .satr("rel", "stylesheet")
    .satr("type", "text/css")
    .satr("media", "invalid");
    Object.entries(attrs).forEach(([k,v],i) => {
      if (k.indexOf("load-on-")) {
        return ch(link).satr(k, v);
      }
      loadsOnEvent = true;
      let eventName = k.slice(8);
      const listener = function(e){
        e && e?.stopPropagation();
        console.log(`dynamic css loading started: ${src}`);
        [...registeredEvents].forEach(([v,[e,l]]) => v.removeEventListener(e, l));
        ch(link).satr("href", src)(this.head)`+> ${link}`;
        setTimeout(() => link.removeAttribute("media"), 17);
      };
      registeredEvents.set(v, [eventName,listener]);
      ch(v).on(eventName, listener);
    });
    if (loadsOnEvent) {
        return Promise.resolve(link);
    }
    ch(link).satr("href", src)(this.head).append(link)
    return new Promise((res,rej) =>
        setTimeout(() => (link.removeAttribute("media"), res(link)), 17)
    );
}
prt.has = function(src){
    return this.ledger.get(src);
}

export default CssToggler;