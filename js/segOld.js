// "use strict";

function makeREG(k) {
    k = k.replace(/\\/g,"\\\\");
    k = k.replace(/\$/g,"\\$");
    k = k.replace(/\(/g,"\\(");
    k = k.replace(/\)/g,"\\)");
    k = k.replace(/\*/g,"\\*");
    k = k.replace(/\+/g,"\\+");
    k = k.replace(/\./g,"\\.");
    k = k.replace(/\[/g,"\\[");
    k = k.replace(/\]/g,"\\]");
    k = k.replace(/\?/g,"\\?");
    k = k.replace(/\^/g,"\\^");
    k = k.replace(/\{/g,"\\{");
    k = k.replace(/\}/g,"\\}");
    k = k.replace(/\|/g,"\\|");
    return k;
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
            contextREG: makeREG(k),
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
    // 看看 freqDict 里有没有 string 为 str 的项目，如果有，该项目的 frequency 加 1 。
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
            if (anotherList[i].len>anotherList[j].len && anotherList[i].string.search(makeREG(anotherList[j].string))) {

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

function string_statistics(txt, minwidth, maxwidth, expwin, dict) {

    const DefultDICT = [{
        string: '',
        len: 0,
        frequency: 0,
        contexts: [{context:'',len:0,freq:0}],
    }];
    var txt = arguments[0] ? arguments[0] : '';
    var minwidth = arguments[1] ? arguments[1] : 1;
    var maxwidth = arguments[2] ? arguments[2] : (minwidth>2 ? minwidth : 2);
    var expwin = arguments[3] ? arguments[3] : 6;
    var dict = arguments[4] ? arguments[4] : DefultDICT;

    txt = clear_txt(txt);

    //**------------------------------------------------------------**//
    // postMessage("正在统计，请耐心等待……");
    // console.log("正在统计，请耐心等待……");

    var txt_length = txt.length;

    if (minwidth>maxwidth) {let x=minwidth; minwidth=maxwidth; maxwidth=x;};
    minwidth = (minwidth>txt_length)?txt_length:minwidth;
    maxwidth = (maxwidth>txt_length)?txt_length:maxwidth;

    var freqDict = dict;
    var strlist = [];
    for (let w = minwidth; w <= maxwidth; w++) {
        // console.log(w);
        for (let i = 0; i <= txt_length-w; i++) {
            let str = txt.slice(i,i+w);
            let j = i - expwin;
            let p = i+w + expwin;
            j = (j>0)?(j):(0);
            p = (p<txt_length)?(p):(txt_length);
            let context = txt.slice(j,p);
            strlist.push({
                str: str,
                context: context,
            });
            // console.log(str);
        }
    }

    // freqDict = strlist;
    freqDict = counteddictlist(strlist);
    // freqDict = mergeDict(freqDict,counteddictlist(strlist));
    // freqDict.sort(function(a,b){

    // console.log(freqDict);
    var baadDictCopy;
    // freqDict.push('DUCKY');
    // baadDictCopy = JSON.parse(JSON.stringify(freqDict));
    // baadDictCopy.push(DefultDICT[0]);
    // freqDict.push('DUCKYAGAIN');

    var reduDict = 'DUCK';
    reduDict = reduceDict(JSON.parse(JSON.stringify(freqDict)));

    reduDict.sort(function(a,b){
        var result;
        result = b.frequency_clear-a.frequency_clear;
        result = (result==0)?(b.len-a.len):result;
        return result;
    });

    var log = {
        // txt: txt,
        // txt_length: txt_length,
        // dict: dict,
        freqDict: freqDict,
        // baadDictCopy: baadDictCopy,
        reduDict: reduDict,
        // minwidth: minwidth,
        // maxwidth: maxwidth,
    };

    return log;
}



self.addEventListener('message', function (e) {
    let e_data = e.data;
    let bbbb = string_statistics(e_data.txt, e_data.minwidth, e_data.maxwidth, e_data.expwin, e_data.dict);
    self.postMessage(bbbb);
    // self.postMessage(e.data);
}, false);

