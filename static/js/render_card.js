function renderCard(values, d){
    const 
    fieldEquivalents = {
        type: ["type", "tip"],
        name: ["name", "isim"],
        content: ["content", "icerik"],
        img: ["img", "resim"]
    },
    getMeta = (field, def) => values?.meta?.[d.name]
        ?.[fieldEquivalents[field].filter(f => values?.meta?.[d.name]?.[f])[0]]
        || def,
    configs = {
        dir: {
            h2: getMeta("type", "Series"),
            h3: getMeta("name", d.name),
            body: getMeta("content", d.path),
            img: getMeta("img", "dirs/" + ((Math.random() * 7 + 1) | 0)),
            border: "gold",
            amblem: "northern_realms",
            rarity: "legendary",
            icon: "folder"
        },
        file: {
            h2: getMeta("type", "Article"),
            h3: getMeta("name", d.name),
            body: getMeta("content", d.path),
            img: getMeta("img", "files/" + ((Math.random() * 5 + 1) | 0)),
            border: "bronze",
            amblem: "nilfgaard",
            rarity: "common",
            icon: "file"
        }
    },
    config = configs?.[d.type] ?? configs.file,
    hasProtocol = /^[a-z]{2,5}:\/\//,
    endsWithExt = /\.[a-z]{2,4}$/,
    startsWithSlash = /^\//;
    return `
        <div data-simplebar style='
            width: 64%;
            height: ${values.cardHeight};
            overflow:auto;
            background-color:${"var(--bg-color-2)"};
            overflow-wrap: break-word;
            padding: 0rem 1.4rem;
            color:${"var(--font-color)"};
        '>
            <div style='
                background-color:${
                    "var(--bg-color)"
                };
                color:${"var(--bg-color-3)"};
                border-bottom-right-radius: 0.5rem;
                border-bottom-left-radius: 0.5rem;
            '>
                <h2>${config.h2}</h2>
                <h3>${config.h3}</h3>
            </div>
            <div>
                <p class="card-body" style='
                    margin-block-start: 0;
                    margin-top:0.5rem;
                '>
                    ${config.body}
                </p>
            </div>
        </div>

        <div style='
            background-color: #ffffff;
            height: ${values.cardHeight};
            position: relative;
            width: calc(${values.cardHeight} * ${values.aspectRatio});
            overflow: hidden;
        '>
            <img data-gamecard-img src="${
                ((url) => {
                    switch(true) {
                        case hasProtocol.test(url):
                            return url
                        case startsWithSlash.test(url):
                            url = url.slice(1);
                            if (endsWithExt.test(url)) {
                                return url;
                            }
                            return `${url}.png`
                        case endsWithExt.test(url):
                            return `static/img/bg-card/${url}`
                        default:
                            return `static/img/bg-card/${url}.png`
                    }
                })(config.img)
            }" ${values.cardImageStyle}>
            <img src="static/img/card/border_${config.border}.png" ${values.cardImageStyle}>
            <img src="static/img/card/default_${config.amblem}.png" ${values.cardImageStyle}>
            <img src="static/img/card/${config.icon}.png" ${values.cardImageStyle}>
            <img src="static/img/card/rarity_${config.rarity}.png" ${values.cardImageStyle}>
        </div>
    `
}

export const render = renderCard;