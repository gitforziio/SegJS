// "use strict";

importScripts('https://cdn.bootcss.com/lodash.js/4.17.15/lodash.js');

self.addEventListener('message', function (e) {
    let e_data = e.data;
    let bbbb = string_statistics(e_data.txt, e_data.minwidth, e_data.maxwidth, e_data.expwin, e_data.dict);
    self.postMessage(bbbb);
    // self.postMessage(e.data);
}, false);

function string_statistics(txt, minwidth, maxwidth, expwin, dict) {

    // 返回内容：
    //    配置
    //    片段频率列表
    //    语境频率列表
    //    片段语境频率列表

    // const DefultDICT = [{
    //     str: '',
    //     str_len: 0,
    //     str_freq: 0,
    //     ctx: '',
    //     ctx_len: 0,
    //     ctx_freq: 0,
    //     all_freq: 0,
    // }];

    const DefultDICT = [];
    var txt = arguments[0] ? arguments[0] : '';
    var minwidth = arguments[1] ? arguments[1] : 1;
    var maxwidth = arguments[2] ? arguments[2] : (minwidth>2 ? minwidth : 2);
    var expwin = arguments[3] ? arguments[3] : 4;
    var dict = arguments[4] ? arguments[4] : DefultDICT;

    txt = clear_txt(txt);

    //**------------------------------------------------------------**//

    var txt_length = txt.length;

    if (minwidth>maxwidth) {let x=minwidth; minwidth=maxwidth; maxwidth=x;};
    minwidth = (minwidth>txt_length)?txt_length:minwidth;
    maxwidth = (maxwidth>txt_length)?txt_length:maxwidth;

    var mainDict;
    var strlist = [];
    for (let w = minwidth; w <= maxwidth; w++) {
        for (let i = 0; i <= txt_length-w; i++) {
            let str = txt.slice(i,i+w);
            let s_l = txt.slice(i-1,i);
            let s_r = txt.slice(i+w,i+w+1);
            let t_l = str[0];
            let t_r = str[str.length-1];
            let j = i - expwin;
            let p = i+w + expwin;
            j = (j>0)?(j):(0);
            p = (p<txt_length)?(p):(txt_length);
            let ctx = txt.slice(j,p);
            strlist.push({
                str: str,
                sxl_pct: 0,// 片段加上左字的频次 占 片段频次 的比例
                sxr_pct: 0,// 片段加上右字的频次 占 片段频次 的比例
                t_l_pct: 0,// 片段频次 占 内左字 的字频 的比例
                t_r_pct: 0,// 片段频次 占 内右字 的字频 的比例
                str_frq: 0,// 片段在文档中的频次
                s_l: s_l,// 左字
                s_r: s_r,// 右字
                t_l: t_l,// 内左字
                t_r: t_r,// 内右字
                a_pct: 0,// 片段所在上下文在该片段所有上下文中所占的比例。越小，该用例越被证明是自由的；越大，该用例要么不自由，要么出现频率小。
                sxl_frq: 0,// 片段加上左字 在文档中的频次
                sxr_frq: 0,// 片段加上右字 在文档中的频次
                ctx: ctx,
                item_frq: 0,// 片段的上下文在文档中的频次
                str_len: str.length,
                ctx_len: ctx.length,
                txt_length: txt_length,
            });
        }
    }

    // let mainDict0 = _.orderBy(strlist, ['str_len','ctx_len'], ['desc','desc']);
    // mainDict = _.groupBy(mainDict0, d=>d.str);

    mainDict = strlist;

    var counts0 = _.countBy(txt, "0");
    var counts = _.countBy(mainDict, d=>d.str);
    var counts1 = _.countBy(mainDict, d=>`${d.str}※${d.ctx}`);
    // var counts_l = _.countBy(mainDict, d=>`${d.str}※${d.s_l}`);
    // var counts_r = _.countBy(mainDict, d=>`${d.str}※${d.s_r}`);
    // var counts2 = _.countBy(mainDict, d=>d.ctx);

    mainDict = _.uniqBy(mainDict, d=>`${d.str}※${d.ctx}`);
    mainDict = _.forEach(mainDict,function(d,i){
        mainDict[i].str_frq = counts[d.str];
        mainDict[i].sxl_frq = counts[d.s_l+d.str]?counts[d.s_l+d.str]:0;
        mainDict[i].sxr_frq = counts[d.str+d.s_r]?counts[d.str+d.s_r]:0;
        mainDict[i].sxl_pct = _.ceil(mainDict[i].sxl_frq/counts[d.str],3);
        mainDict[i].sxr_pct = _.ceil(mainDict[i].sxr_frq/counts[d.str],3);
        // mainDict[i].t_l_pct = counts0[d.t_l]?_.ceil(counts0[d.t_l]/txt_length,3):0;
        // mainDict[i].t_r_pct = counts0[d.t_r]?_.ceil(counts0[d.t_r]/txt_length,3):0;
        mainDict[i].t_l_pct = counts0[d.t_l]?_.ceil(mainDict[i].str_frq/counts0[d.t_l],3):0;
        mainDict[i].t_r_pct = counts0[d.t_r]?_.ceil(mainDict[i].str_frq/counts0[d.t_r],3):0;
        mainDict[i].item_frq = counts1[`${d.str}※${d.ctx}`];
        mainDict[i].a_pct = _.ceil(mainDict[i].item_frq/mainDict[i].str_frq,3);
    });
    // mainDict = _.orderBy(mainDict, ['str_frq','str_len','str','a_pct','item_frq','ctx_len','ctx'], ['desc','desc','asc','asc','desc','desc','asc']);
    // mainDict = _.orderBy(mainDict, ['str_frq','a_pct','str_len','str','item_frq','ctx_len','ctx'], ['desc','asc','desc','asc','desc','desc','asc']);


    var strDict = _.cloneDeep(mainDict);
    strDict = _.uniqBy(strDict, d=>`${d.str}※${(d.a_pct>0.06)?(d.a_pct+"※"+d.ctx):(d.a_pct)}`);
    // strDict = _.forEach(strDict, function(d,i) {strDict[i]=_.pick(strDict[i], ['a_pct','str','str_len','str_frq']);});
    strDict = _.orderBy(strDict, ['str_frq','sxl_pct','t_l_pct','sxr_pct','t_r_pct','str','str_len'], ['desc','asc','desc','asc','desc','asc','desc']);

    wordDict = _.filter(strDict, function(d) { return d.str_len>1&&d.sxl_pct<0.5&&d.sxr_pct<0.5&&d.t_l_pct>0.3&&d.t_r_pct>0.3&&d.sxl_pct!=0&&d.sxr_pct!=0; });




    // mainDict = counteddictlist(strlist);

    // var reduDict = reduceDict(_.cloneDeep(mainDict));
    // reduDict.sort(function(a,b){
    //     var result;
    //     result = b.frequency_clear-a.frequency_clear;
    //     result = (result==0)?(b.len-a.len):result;
    //     return result;
    // });

    var log = {
        // mainDict: mainDict,
        strDict: strDict,
        wordDict: wordDict,
        // counts: counts,
        // counts1: counts1,
        // reduDict: reduDict,
    };

    return log;
}







function countedcontexts(list) {
    if(list.length==0){console.log("开始时已经有空数组了");};

    let dct = {};
    list.forEach((item)=>{
        item = String(item);
        if(item in dct){
            dct[item]++;
        } else {
            dct[item] = 1;
        }
    });
    var ctd = [];
    // console.log(Object.keys(dct));
    Object.keys(dct).forEach((k,i)=>{
        ctd.push({
            context: k,
            contextREG: _.escapeRegExp(k),
            len: k.length,
            freq: dct[k],
        });
    })

    if(ctd.length==0){console.log("结束时有空数组");};
    return ctd;
}

function counteddictlist(list) {

    let dct = {};
    list.forEach((item)=>{
        if(item.str in dct){
            dct[item.str].push(item.context);
        } else {
            dct[item.str] = [item.context];
        }
    });
    var ctd = [];
    Object.keys(dct).forEach((k,i)=>{
        // let contexts = dct2[k];
        let contexts = countedcontexts(dct[k]);
        if(contexts.length==0){console.log("调用后出现空数组");};
        // contexts.sort(function(a,b){
        //     var result;
        //     result = b.freq-a.freq;
        //     // result = (result==0)?(b.len-a.len):result;
        //     return result;
        // });
        ctd.push({
            string: k,
            len: k.length,
            frequency: dct[k].length,
            frequency_clear: dct[k].length,
            contexts: contexts,
            pro: "counteddictlist",
        });
    })

    return ctd;
}

function mergeDict(l1,l2) {
    // 看看 mainDict 里有没有 string 为 str 的项目，如果有，该项目的 frequency 加 1 。
    return l2;
}

function reduceDict(lst) {
    console.log("reduceDict");
    var anotherList = lst;
    anotherList.sort(function(a,b){
        var result;
        result = b.len-a.len;
        if (result==0) {result = b.frequency-a.frequency};
        return result;
    });

    // 在 列表 中 遍历 片段甲 和 片段乙
    for (let i = 0; i < anotherList.length-1; i++) {
        for (let j = i+1; j < anotherList.length; j++) {
        // for (let j = i+1; j < anotherList.length; j++) {

            // console.log("reduceDict2");
            // let a = anotherList[i];// 片段甲
            // let b = anotherList[j];// 片段乙

            // if (a.len<b.len) {
            //     let c = a; a = b; b = c;
            // }

            // 如果（在 片段甲 中 找得到 片段乙，并且 片段甲 长于 片段乙）那么
            if (anotherList[i].len>anotherList[j].len && anotherList[i].string.search(_.escapeRegExp(anotherList[j].string))) {

                // 片段甲的语境清单为清单甲，片段乙中的语境清单为清单乙
                let ctxts_a = anotherList[i].contexts;// 清单甲
                let ctxts_b = anotherList[j].contexts;// 清单乙

                // 在 清单甲 中 遍历 甲语境；在 清单乙 中 遍历 乙语境
                for (let ii = 0; ii < ctxts_a.length; ii++) {
                    for (let jj = 0; jj < ctxts_b.length; jj++) {

                        let ctxt_a = ctxts_a[ii];// 甲语境
                        let ctxt_b = ctxts_b[jj];// 乙语境

                        // 如果（在 甲语境 中 找得到 乙语境）那么
                        if (ctxt_a.freq>0 && ctxt_b.freq>0 && ctxt_a.context.search(ctxt_b.contextREG)>=0) {
                            ctxts_b[jj].freq = ctxt_b.freq-ctxt_a.freq;//乙语境的数量 等于 乙语境的数量 减去 甲语境的数量
                            // ctxt_b = ctxts_b[jj];
                        }

                    }
                }
                ctxts_b = ctxts_b.filter(function(boy){return(boy.freq>0);});// 过滤掉 清单乙 中 频率消失的 语境
                // console.log(ctxts_b);
                anotherList[j].contexts = ctxts_b;
                anotherList[j].frequency_clear = ctxts_b.length;
                anotherList[j].pro = "reduceDict";
            }
        }
    }

    anotherList = anotherList.filter(function(boy){return(boy.contexts.length>0);});
    return anotherList;

}

function clear_txt(txt) {
    txt = `${txt.replace(/([\n\r\s\t]+)/g,' ').trim()}`;
    // txt = `${txt.replace(/\\|\//g,' ').trim()}`;
    return txt;
}



