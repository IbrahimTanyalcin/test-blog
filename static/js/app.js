!async function(){
    ch`
    0> cacheGen:${await import("./stampForage.js")}
    0> hashRenderGen:${await import("./hashRender.js")}
    @> docEl:${document.documentElement}
    @> body:${document.body}
    @> head:${document.head}
    0> textContainerOne:${document.querySelector(".text-container-1")}
    0> ${await import("./loader.js")}
    0> item:${`
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: center;
    `}
    0> itemMargin: ${8}
    0> itemMarginSmall: ${4}
    0> cardHeight: ${"clamp(240px, 20vh, 720px)"}
    0> cardHeightSmall: ${"clamp(80px, 8vh, 240px)"}
    0> aspectRatio: ${249 / 357}
    0> cardImageStyle: ${
        'style="width:100%; position: absolute; top: 0; left: 0;"'
    }
    0> renderStyles: ${await import("./render_styles.js")}
    adopt ...${[
        "game-card", 
        (await import(
            "./component-game-card.js"
        )).render
    ]}
    *> ${"style"} |> sappend ${0}
    >> textContent ${({values}) => values.renderStyles.render(values)}
    0> cont: ${ch.select("#card-container", document.body).selected}
    0> weakmap:${new WeakMap()}
    0> rm:${Symbol("toBeRemoved")}
    0> fragment:${ch.crtFragment(1).lastOp[0]}
    0> comparer:${{ en: new Intl.Collator("en").compare }}
    => ${({values}) => () => values.pickle = ch.pickle`
        => ${() => () => {
            values.textContainerOne._contentReady = false;
            ch(values.textContainerOne)
            .animate(
                [{opacity: 0}],
                {duration: 250, ease: "ease-in-out", fill: "both"}
            )
        }}
        -> ${values.cont}
        => ${() => () => values.data.sort(
            (a, b) => (values?.meta[b?.["name"]]?.order || 0)
                - (values?.meta[a?.["name"]]?.order || 0)
                || values.comparer.en(a?.["name"],b?.["name"])
        )}
        => ${() => () => {
            values.data.filter(d => {
                let node = values.weakmap.get(d);
                if (node && !node[values.rm]){
                    ch(node)
                    .cancelAnimate({
                        commit: ["transform"]
                    })(values.cont);
                    return 0;
                }
                return 1;
            }).forEach((d,i) => {
                values.weakmap.set(
                    d,
                    ch`
                    <game-card ${{ data: {values, d} }}/>
                    +< ${values.cont}`.selected
                )
            })
        }}
        -> ${values.cont}
        => ${() => () => {
            if (!values.data.length){return}
            const firstCard = values.weakmap.get(values.data[0]);
            values.currentItemMargin = +getComputedStyle(firstCard)
            .getPropertyValue("--use-small-margin")
                ? values.itemMarginSmall : values.itemMargin;
            values.dims = firstCard.getBoundingClientRect();
            values.children = Array.from(values.cont.children);
        }}
        &> ${() => (n,i,c) => {
            if (n[values.rm]) {return}
            if (!values.data.includes(n.dataRef)){
                return ch(n).addClass("fadeOutDown")
                .set(values.rm, true)
                .animate([],{duration:1000})
            }
            ch`
            -> ${n}
            => ${() => () => {
                const
                    iData = values.data.indexOf(n.dataRef),
                    iDiff = iData - i;
                ch.animate([
                    {
                        transform: `translate(0px, ${
                            iDiff * (values.dims.height + values.currentItemMargin)
                        }px)`
                    }
                ],{duration:1000, easing: "ease-in-out", fill: "both"})
            }}
            `
        }}
        => ${() => () => {
            const
                nodes = values.data.map(d => values.weakmap.get(d)),
                promises = nodes.map(n => ch(n).promiseAnimate());
            return Promise.all(promises).then((results) => {
                ch()`
                -> ${values.fragment}
                +> ${nodes}
                &> ${() => (n) => ch(n)
                    .rmClass("fadeInUp")
                    .immediateAnimate([
                        {transform: "translate(0px, 0px)"}
                    ])
                }
                -> ${(values.cont.replaceChildren(), values.cont)}
                prepend ${[values.fragment]}
                => ${() => () => {
                    ch(values.textContainerOne).set("_contentReady", true)
                }}
                `
            }).catch(() => {})
        }}
    `}
    => ${({values:v}) => () => {
        const callback = ch.throttle(({val, prop, oldVal}) => {
            ch(v.pickle);
        }, {delay: 100});
        v.callbackRender = callback;
        v.hashRender = new v.hashRenderGen.default({
            aref: v.data = ch.aref([],{cb: callback}),
            cache: v.cache = new v.cacheGen.default(),
            values: v
        })
    }}
    => ${({values:v}) => () => v.hashRender.renderDataFromHash()}
    => ${({values:v}) => () => {
        ch(document.getElementById("data-refresh")).on("click", async function(){
            if(this._busy){return}
            this._busy = true;
            const result = await Swal.fire({
                icon: "warning",
                title: "Proceed?",
                text: `This will remove your local data and force a refresh from github for next time.
                You are not advised to do this more than 60 times per hour.`,
                showCancelButton:true
            });
            if(!result.isConfirmed){
                return this._busy = false;
            }
            await v.cache.clear();
            console.log(`Cleared cache: ${(new Date()).toUTCString()}`);
            return this._busy = false;
        })
    }}
    `
}()