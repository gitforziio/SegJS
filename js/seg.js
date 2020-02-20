
function counted(list) {
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
            string: k,
            frequency: dct[k],
        });
    })
    return ctd;
}

function mergeDict(l1,l2) {
    // 看看 freqDict 里有没有 string 为 str 的项目，如果有，该项目的 frequency 加 1 。
    return l2;
}


function string_statistics(txt, minwidth, maxwidth, dict) {
    const DefultDICT = [{
        string: '',
        frequency: 0,
    }];
    var txt = arguments[0] ? arguments[0] : '';
    var minwidth = arguments[1] ? arguments[1] : 1;
    var maxwidth = arguments[2] ? arguments[2] : (minwidth>2 ? minwidth : 2);
    var dict = arguments[3] ? arguments[3] : DefultDICT;

    //**------------------------------------------------------------**//

    var txt_length = txt.length;

    var freqDict = dict;
    var strlist = [];
    for (let w = minwidth; w <= maxwidth; w++) {
        // console.log(w);
        for (let i = 0; i <= txt.length-1-w; i++) {
            let str = txt.slice(i,i+w);
            strlist.push(str);
            // console.log(str);
        }
    }

    freqDict = mergeDict(freqDict,counted(strlist));

    freqDict.sort(function(a,b){return b.frequency-a.frequency;});

    var log = {
        txt: txt,
        txt_length: txt_length,
        dict: dict,
        freqDict: freqDict,
        minwidth: minwidth,
        maxwidth: maxwidth,
    };
    console.log(log);
    return log;
}





