
function countedcontexts(list) {

    let dct = {};
    list.reduce((total,item)=>{
        if(item in dct){
            dct[item]++;
        } else {
            dct[item] = 1;
        }
    });
    var ctd = [];
    Object.keys(dct).forEach((k,i)=>{
        ctd.push({
            context: k,
            len: k.length,
            freq: dct[k],
        });
    })
    return ctd;
}

function counteddictlist(list) {

    let dct = {};
    let dct2 = {};
    list.reduce((total,item)=>{
        if(item.str in dct){
            dct[item.str]++;
            dct2[item.str].push(item.context);
        } else {
            dct[item.str] = 1;
            dct2[item.str] = [item.context];
        }
    });
    var ctd = [];
    Object.keys(dct).forEach((k,i)=>{
        let contexts = countedcontexts(dct2[k]);
        contexts.sort(function(a,b){
            var result;
            result = b.freq-a.freq;
            // result = (result==0)?(b.len-a.len):result;
            return result;
        });
        ctd.push({
            string: k,
            len: k.length,
            frequency: dct[k],
            contexts: contexts,
        });
    })
    return ctd;
}

function mergeDict(l1,l2) {
    // 看看 freqDict 里有没有 string 为 str 的项目，如果有，该项目的 frequency 加 1 。
    return l2;
}

function clear_txt(txt) {
    txt = `${txt.replace(/([\n\r\s\t]+)/g,' ').trim()}`
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
    var expwin = arguments[3] ? arguments[3] : 4;
    var dict = arguments[4] ? arguments[4] : DefultDICT;

    txt = clear_txt(txt);

    //**------------------------------------------------------------**//
    // postMessage("正在统计，请耐心等待……");
    // console.log("正在统计，请耐心等待……");

    var txt_length = txt.length;

    var freqDict = dict;
    var strlist = [];
    for (let w = minwidth; w <= maxwidth; w++) {
        // console.log(w);
        for (let i = 0; i <= txt_length-1-w; i++) {
            let str = txt.slice(i,i+w);
            let j = i - expwin;
            j = (j>0)?(j):(0);
            let p = i+w + expwin;
            p = (p<=txt_length)?(p):(txt_length);
            let context = txt.slice(j,p);
            strlist.push({
                str: str,
                context: context,
            });
            // console.log(str);
        }
    }

    freqDict = mergeDict(freqDict,counteddictlist(strlist));

    freqDict.sort(function(a,b){
        var result;
        result = b.frequency-a.frequency;
        result = (result==0)?(b.len-a.len):result;
        return result;
    });

    // postMessage("统计完毕！");
    // console.log("统计完毕！");
    var log = {
        txt: txt,
        txt_length: txt_length,
        dict: dict,
        freqDict: freqDict,
        minwidth: minwidth,
        maxwidth: maxwidth,
    };
    // postMessage(log);
    // console.log(log);
    return log;
}



self.addEventListener('message', function (e) {
    let e_data = e.data;
    let bbbb = string_statistics(e_data.txt, e_data.minwidth, e_data.maxwidth, e_data.expwin, e_data.dict);
    self.postMessage(bbbb);
    // self.postMessage(e.data);
}, false);

