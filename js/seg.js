// "use strict";

importScripts('https://cdn.bootcss.com/lodash.js/4.17.15/lodash.js');

self.addEventListener('message', function (e) {
    let e_data = e.data;
    let bbbb = string_statistics(e_data.txt, e_data.minwidth, e_data.maxwidth, e_data.expwin, e_data.dict);
    self.postMessage({stage:"result",data:bbbb});
    let segged = seg(bbbb);
    self.postMessage({stage:"segged",data:segged});
    // self.postMessage(e.data);
}, false);

function string_statistics(txt, minwidth, maxwidth, expwin, dict) {

    let vapct = 0.075;  // >= 片段所在上下文占片段所有上下文的比例 至少达到多少时，视为一个实例（比如“的”所在片段过于灵活，就不考虑实例了）（决定了分词时要不要特别对待）
    let vlen = 1;       // >= 片段至少有几个字符
    let vvv0 = 3;       // >= 该片段在文档中至少出现多少次
    let vvv1 = 0.7;     // <= 该片段在相同外部环境中最多占多大比例（越大，越有可能是词或短语内部的一部分，而不是独立的词）
    let vvv2 = 0.05;    // >= 内部首尾字用在该片段中的概率至少达到多少（越大，越粘合）

    // let vapct = 0.075;  // >= 片段所在上下文占片段所有上下文的比例 至少达到多少时，视为一个实例（比如“的”所在片段过于灵活，就不考虑实例了）（决定了分词时要不要特别对待）
    // let vlen = 2;       // >= 片段至少有几个字符
    // let vvv0 = 3;       // >= 该片段在文档中至少出现多少次
    // let vvv1 = 0.7;     // <= 该片段在相同外部环境中最多占多大比例（越大，越有可能是词或短语内部的一部分，而不是独立的词）
    // let vvv2 = 0.15;    // >= 内部首尾字用在该片段中的概率至少达到多少（越大，越粘合）

    // let vapct = 0.075;  // >= 片段所在上下文占片段所有上下文的比例 至少达到多少时，视为一个实例（比如“的”所在片段过于灵活，就不考虑实例了）（决定了分词时要不要特别对待）
    // let vlen = 2;       // >= 片段至少有几个字符
    // let vvv0 = 1;       // >= 该片段在文档中至少出现多少次
    // let vvv1 = 1;       // <= 该片段在相同外部环境中最多占多大比例（越大，越有可能是词或短语内部的一部分，而不是独立的词）
    // let vvv2 = 0;       // >= 内部首尾字用在该片段中的概率至少达到多少（越大，越粘合）

    let each_size = 5000  // 每个文档块的最大字符数

    //**------------------------------------------------------------**//

    const DefultDICT = [];
    var txt = arguments[0] ? arguments[0] : '';
    var minwidth = arguments[1] ? (arguments[1]>1?Math.floor(arguments[1]):1) : 1;
    var maxwidth = arguments[2] ? (arguments[2]>minwidth?Math.floor(arguments[2]):minwidth) : (minwidth>2 ? minwidth : 2);
    var expwin = arguments[3] ? Math.floor(arguments[3]) : 4;
    var dict = arguments[4] ? arguments[4] : DefultDICT;

    minwidth = (minwidth>each_size)?each_size:minwidth;
    maxwidth = (maxwidth>each_size)?each_size:maxwidth;

    txt = clear_txt(txt);
    var txt_length = txt.length;

    var tcts = txt2tcts(txt, each_size, maxwidth+expwin);

    //**------------------------------------------------------------**//

    var mainDict;
    var strlist = [];

    tcts.forEach((tct,tid)=>{
        let tct_len = tct.length;
        for (let w = minwidth; w <= maxwidth+1; w++) {
            let range_len = (tct_len>each_size)?(each_size):(tct_len-w+1);
            for (let i = 0; i < range_len; i++) {
                let i_w = i+w;
                let j = i - expwin;
                j = (j>0)?(j):(0);
                let p = i_w + expwin;
                p = (p<tct_len)?(p):(tct_len);
                let ctx = tct.slice(j,p);
                let str = tct.slice(i,i_w);
                let s_l = tct.slice(i-1,i);
                let s_r = tct.slice(i_w,i_w+1);
                let t_l = str[0];
                let t_r = str[str.length-1];
                strlist.push({
                    str: str,
                    sxl_pct: 0,// 片段加上左字的频次 占 片段频次 的比例（越高，说明越可能是加左字后片段中的一部分）（外不自由度）
                    sxr_pct: 0,// 片段加上右字的频次 占 片段频次 的比例（越高，说明越可能是加右字后片段中的一部分）（外不自由度）
                    t_l_pct: 0,// 片段频次 占 内左字 的字频 的比例（越高，说明左字在该片段中越粘合）（内凝固度）
                    t_r_pct: 0,// 片段频次 占 内右字 的字频 的比例（越高，说明右字在该片段中越粘合）（内凝固度）
                    str_frq: 0,// 片段在文档中的频次
                    s_l: s_l,// 左字
                    s_r: s_r,// 右字
                    t_l: t_l,// 内左字
                    t_r: t_r,// 内右字
                    a_pct: 0,// 片段所在上下文在该片段所有上下文中所占的比例。越小，该用例越被证明是自由的；越大，该用例要么不自由，要么出现频率小。（决定了分词时要不要特别对待）
                    sxl_frq: 0,// 片段加上左字 在文档中的频次
                    sxr_frq: 0,// 片段加上右字 在文档中的频次
                    ctx: ctx,
                    ctx_frq: 0,// 片段的上下文在文档中的频次
                    str_slice_start: i,
                    ctx_slice_start: j,
                    tid: tid,
                    // str_len: str.length,
                    // ctx_len: ctx.length,
                    // txt_length: txt_length,
                });
            }
        }
    });

    postMessage({stage:"strlist",data:`strlist.length: ${strlist.length}`});

    //**------------------------------------------------------------**//

    mainDict = _.cloneDeep(strlist);

    var counts0 = _.countBy(txt, "0");
    var counts = _.countBy(mainDict, d=>d.str);
    var counts1 = _.countBy(mainDict, d=>`${d.str}※${d.ctx}`);

    mainDict = _.uniqBy(mainDict, d=>`${d.str}※${d.ctx}`);
    // mainDict = _.uniqBy(mainDict, d=>`${d.s_l}※${d.str}※${d.s_r}`);

    mainDict = _.forEach(mainDict,function(d,i){
        let counts_str = counts[d.str];
        let counts_s_l = counts[d.s_l+d.str];
        let counts_s_r = counts[d.str+d.s_r];
        mainDict[i].str_frq = counts_str;
        mainDict[i].sxl_frq = counts_s_l?counts_s_l:0;
        mainDict[i].sxr_frq = counts_s_r?counts_s_r:0;

        mainDict[i].sxl_pct = __ceil((counts_s_l?counts_s_l:0)/counts_str,3);
        mainDict[i].sxr_pct = __ceil((counts_s_r?counts_s_r:0)/counts_str,3);

        let counts_t_l = counts0[d.t_l];
        let counts_t_r = counts0[d.t_r];
        mainDict[i].t_l_pct = counts_t_l?__ceil(counts_str/counts_t_l,3):0;
        mainDict[i].t_r_pct = counts_t_r?__ceil(counts_str/counts_t_r,3):0;
        let ctx_frq = counts1[`${d.str}※${d.ctx}`]
        mainDict[i].ctx_frq = ctx_frq;
        mainDict[i].a_pct = __ceil(ctx_frq/counts_str,3);
    });

    // mainDict = _.orderBy(mainDict, ['str_frq','str_len','str','a_pct','ctx_frq','ctx_len','ctx'], ['desc','desc','asc','asc','desc','desc','asc']);
    // mainDict = _.orderBy(mainDict, ['str_frq','a_pct','str_len','str','ctx_frq','ctx_len','ctx'], ['desc','asc','desc','asc','desc','desc','asc']);


    // postMessage({stage:"mainDict",data:`mainDict`});
    postMessage({stage:"mainDict",data:`mainDict.length: ${mainDict.length}`});

    //**------------------------------------------------------------**//

    var strDict = _.cloneDeep(mainDict);
    strDict = _.uniqBy(strDict, d=>`${d.str}※${(d.a_pct>=vapct)?(_.ceil(d.a_pct,3)+"※"+d.ctx):(_.ceil(d.a_pct,3))}`);

    // // strDict = _.forEach(strDict, function(d,i) {strDict[i]=_.pick(strDict[i], ['str','sxl_pct','sxr_pct','t_l_pct','t_r_pct','str_frq','a_pct']);});

    strDict = _.orderBy(strDict, ['str_frq','sxl_pct','sxr_pct','t_l_pct','t_r_pct','str'], ['desc','asc','asc','desc','desc','asc']);


    postMessage({stage:"strDict",data:`strDict.length: ${strDict.length}`});
    // postMessage({stage:"strDict",data:strDict});

    //**------------------------------------------------------------**//

    wordDict = _.filter(strDict, function(d) { return (d.str.length>=vlen&&d.str_frq>=vvv0&&_.max([d.sxl_pct,d.sxr_pct])<=vvv1&&_.min([d.t_l_pct,d.t_r_pct])>=vvv2&&d.sxl_pct!=0&&d.sxr_pct!=0); });
    // wordDict = _.filter(strDict, function(d) { return (d.a_pct>=vapct)&&(d.str.length>=vlen&&d.str_frq>=vvv0&&_.max([d.sxl_pct,d.sxr_pct])<=vvv1&&_.min([d.t_l_pct,d.t_r_pct])>=vvv2&&d.sxl_pct!=0&&d.sxr_pct!=0); });
    // wordDict = _.filter(strDict, function(d) { return (d.str.length==1&&d.str_frq>=vvv0&&_.max([d.sxl_pct,d.sxr_pct])<=vvv1&&_.min([d.t_l_pct,d.t_r_pct])>=vvv2&&d.sxl_pct!=0&&d.sxr_pct!=0); });

    wordDict = _.uniqBy(wordDict, d=>`${d.str}※${d.sxl_pct}※${d.sxr_pct}※${d.t_l_pct}※${d.t_r_pct}`);
    // wordDict = _.uniqBy(wordDict, d=>`${d.str}`);

    postMessage({stage:"wordDict",data:`wordDict.length: ${wordDict.length}`});

    //**------------------------------------------------------------**//

    var dictSet = {
        wordDict: wordDict,
        inputs: {
            tcts: tcts,
            txt_length: txt_length,
            expwin: expwin,
            minwidth: minwidth,
            maxwidth: maxwidth,
        },
        settings: {
            each_size: each_size,
            vapct: vapct,
            vlen: vlen,
            vvv0: vvv0,
            vvv1: vvv1,
            vvv2: vvv2,
        },
        // mainDict: mainDict,
        // strDict: strDict,
        // counts: counts,
        // counts1: counts1,
        // reduDict: reduDict,
    };

    return dictSet;
}



function clear_txt(txt) {
    txt = `${txt.replace(/([\n\r\s\t]+)/g,' ').trim()}`;
    // txt = `${txt.replace(/\\|\//g,' ').trim()}`;
    return txt;
}

function __ceil(a) {
    return a;
}

function txt2tcts(txt, each_size, width) {
    var tcts = [];
    var txt_len = txt.length;

    var notend = true;
    let i = 0;

    while (notend) {
        let j = i+each_size;
        let tct = txt.slice(i, j+width+1);
        tcts.push(tct);
        i = j;
        if (j>=txt_len) {notend = false};
    }

    return tcts;
}



function seg(dictSet) {
    var tcts = dictSet.inputs.tcts;
    var tvts = [];
    tcts.forEach(tct=>{
        let tvt = [];
        tct = tct.split("");
        tct.forEach((t,i)=>{tvt.push({str:t, pl:0, pr:0})})
        tvts.push(tvt);
    });
    var wds = dictSet.wordDict;
    wds.forEach(wd=>{
        tvts[wd.tid][wd.str_slice_start].pl+=1;
        tvts[wd.tid][wd.str_slice_start+wd.str.length-1].pr+=1;
    });
    // tvts.forEach((tvt,i)=>{
    //     // tvts[i]=tvts[i].slice();
    //     tvts[i]=tvts[i].join("");
    // });
    postMessage({stage:"SEG!!!",data:tvts});
}





