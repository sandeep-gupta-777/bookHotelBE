
const db = require('../db/index');




function randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

let findbyID = function (id) {
    // console.log("in helpers...finding by id");
    return new Promise(function (resolve, reject) {
        db.siteUserModel.findById(id, function (error, user) {
            if(error){
                reject(error)
            }
            else {
                resolve(user)
            }
        })
    })
};

function assignOrderToWorkShopAdmin(orderObj) {
//    In real world scenerio this function needs to implemented according to nearest workshop and other criteria
    orderObj.orderAssignedTo_fullName = "Sandeep Gupta";
    orderObj.orderAssignedTo_id = "5a3e6c4e37147c37dcf15c75";
    return orderObj;
}
let findOne = function (profileID) {
    return db.siteUserModel.findOne({'profileID': profileID}); // this returns a promise
};
let createNewUser = function (profile) {

    // console.log("creating new user, loggin profile as recieved by facebook");

    //new Model({data}) doesnt retuerns the promise => we have to create by ourself
    return new Promise(function(resolve, reject){
        let newSiteUser = new db.siteUserModel({

            profileID:profile.id,
            fullName: profile.displayName,
            profilePicURL: profile.photos[0].value || ''
        });
        newSiteUser.save(function (error) {
            if(error){
                reject(error);
            }else {
                resolve(newSiteUser);
            }
        });
    });
};

function queryBuilder(searchQuery){
    if(searchQuery) {

        let tempArray = searchQuery.split(' ');
        for(let i=0;i<tempArray.length;++i){
            tempArray[i] = "(.*"+tempArray[i] + ".*)";
        }
        queryRegex= new RegExp(tempArray.toString().replace(',','|'),'i');
        return query = {$or:[{blogText:queryRegex}, {blogTitle:queryRegex},{blogTags:queryRegex}]};
    }
    else
        return query={};
}

// function replaceHashBySpan(text) {
//
//     for(let i=0;i<substringToBeHighlightedArray.length;i++){
//         console.log('before');
//         console.log(text);
//         text = text.replace('%%','<span class="highlight">');
//         text = text.replace('**','<span/>');
//         console.log('after');
//         console.log(text);
//
//     }
//
// }
let substringToBeHighlightedArray = [];

function caseInsensitiveReplace(text,query) {
    let matchedWordsInText = text && text.match(new RegExp(  query , 'gi' )) || [];
    matchedWordsInText = removeDuplicateWordsFromArray(matchedWordsInText);
    for(let i=0;i<matchedWordsInText.length;i++){
        text = text.replace(new RegExp(matchedWordsInText[i],'g'),'%%'+ matchedWordsInText[i] + '&&');
        substringToBeHighlightedArray.push('<span class="searchQuery">'+matchedWordsInText[i]+'</span>');
    }

    return text;
}

function findAndMakeSearchQueryBoldInGivenText(resultArray, searchQuery){

    let searchQuerySubstringArray = searchQuery.split(" ");
    for(let i=0;i<resultArray.length;i++){
        //doing this for each word in searchQuery

        for(let j=0;j<searchQuerySubstringArray.length;j++){
            if(searchQuerySubstringArray[j]=="")//this is because stupid split method will convert "sandeep " to ["sandeep",""] instead of ["sandeep"]
                continue;
            /*Following text replaces(case insensitively) search query substring in blogTitle, blogHTML to `<span class="searchQuery">${searchQuery}</span>`  */
            resultArray[i].blogTitle= caseInsensitiveReplace(resultArray[i].blogTitle,searchQuerySubstringArray[j]);
        }

        // for(let j=0;j<searchQuerySubstringArray.length;j++){
        //     resultArray[i].blogTitle= replaceHashBySpan(resultArray[i].blogTitle);
        // }
        // substringToBeHighlightedArray = [];
        for(let j=0;j<searchQuerySubstringArray.length;j++){
            if(searchQuerySubstringArray[j]=="")//this is because stupid split method will convert "sandeep " to ["sandeep",""] instead of ["sandeep"]
                continue;
            /*Following text replaces(case insensitively) search query substring in blogTitle, blogHTML to `<span class="searchQuery">${searchQuery}</span>`  */
            resultArray[i].blogText= caseInsensitiveReplace(resultArray[i].blogText,searchQuerySubstringArray[j]);
        }

        for(let i=0;i<resultArray.length;i++){
            resultArray[i].blogTitle =resultArray[i].blogTitle.replace(new RegExp('%%','gi'),"<span class='searchQuery'>") ;

            resultArray[i].blogTitle =resultArray[i].blogTitle.replace(new RegExp('&&','gi'),'</span>') ;

            resultArray[i].blogText =resultArray[i].blogText.replace(new RegExp('%%','gi'),"<span class='searchQuery'>") ;
            resultArray[i].blogText =resultArray[i].blogText.replace(new RegExp('&&','gi'),'</span>') ;
        }

        //
        // for(let j=0;j<searchQuerySubstringArray.length;j++){
        //     resultArray[i].blogText=  replaceHashBySpan(resultArray[i].blogText);
        // }


            // resultArray[i].blogTitle.replace(searchQuery,`<span class="searchQuery">${searchQuery}</span>`);
        // resultArray[i].blogHTML = resultArray[i].blogHTML.replace(searchQuery,`<span class="searchQuery">${searchQuery}</span>`);
    }
    return resultArray;
}
function calculateRelevancyForEachResult(resultArray, searchQuery) {
    /*This method will calculate the (exact , case insensitive) occurance of each word of searchQuery*/
    let searchQuerySubstringArray = searchQuery.split(" ");

    //calculating keyword match count
    for(let i=0;i<resultArray.length;i++){
        // ("str1,str2,STR3,str4").match(new RegExp("str", "gi"));
        for(let j=0;j<searchQuerySubstringArray.length;j++){
            let tempcount =  ((resultArray[i].blogText).match(new RegExp(searchQuerySubstringArray[j], "gi")) || []).length;
            tempcount =  tempcount + ((resultArray[i].blogHTML).match(new RegExp(searchQuerySubstringArray[j], "gi")) || []).length;
            resultArray[i].blogRelevency = resultArray[i].blogRelevency + tempcount;
        }
    }
    return resultArray;
}
let distance = 5;
function addEllpisis(blogText, searchQuery) {

    let blogHTMlSubstringArray = blogText.split(" ");//an array of all the words in article
    let searchQuerySubstringArray = searchQuery.split(" ");
    let indexOfSearchQueryArray=[]; //an array of index of searchQuery present in blogHTMlSubstringArray
    for(let i=0;i<blogHTMlSubstringArray.length;i++){
        /*above for loop will populate indexOfSearchQueryArray*/
        for(let j=0;j<searchQuerySubstringArray.length;j++){
            let searchQueryWord = searchQuerySubstringArray[j];
            if(searchQueryWord!=="" && blogHTMlSubstringArray[i].match(new RegExp(searchQueryWord,'gi'))){
                indexOfSearchQueryArray.push(i);

            }
        }
    }

    let searchQueryCount = indexOfSearchQueryArray.length;
    let arrayOfFillerArray = [];//this will be a 2d array,
    let indexOfSearchQueryArrayCopy = indexOfSearchQueryArray;
    for(let i=0;i<searchQueryCount;i++){
        /*expand blogHTMlSubstringArray*/
        let searchQueryPosition = indexOfSearchQueryArrayCopy[i];
        let fillerArray=generateFillerArray(searchQueryPosition,blogHTMlSubstringArray.length);
        arrayOfFillerArray.push(fillerArray);
        // indexOfSearchQueryArray.splice(i,1,...fillerArray);
    }

    let str = "...";
    let merge2DArray = [];
    for(var i=0;i<arrayOfFillerArray.length;i++){
        merge2DArray=  merge2DArray.concat(arrayOfFillerArray[i]);
    }
    //remove duplicate from merge array
    merge2DArray = merge2DArray.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    merge2DArray.sort(function sortNumber(a,b) {
        return a - b;
    });
    //if indexes are not consecutive..add -1 to mark ellipsis
    let merge2DArrayLength = merge2DArray.length;
    for(let i=0;i<merge2DArrayLength;i++){
        if(merge2DArray[i+1] - merge2DArray[i]!==1){
            merge2DArray.splice(i+1,0,-1);
            i = i+2;
        }
    }


    for(let i=0;i<merge2DArray.length;i++){
        let searchQueryPosition = merge2DArray[i];
        if(searchQueryPosition === -1)
        {
            str = str + '...';
        }
        else
        str = str + " "+ blogHTMlSubstringArray[searchQueryPosition];
    }
    str = str + '...';
    if(str === '......')//this will happen where search query will not match any word in text
    {
        // return blogText.slice(0,250) + '...';
        return blogText.split(" ").slice(0,50).join(' ') + ' ...';//returning first 50 words
    }
    return str;
}

function generateFillerArray(n, arrayLength) {//max = array.length
    arr=[];
    let min = n-distance >=0?n-distance:0;
    let max= n+distance<=arrayLength-1?n+distance:arrayLength-1;
    for(let i=min;i<=max;i++){
        arr.push(i);
    }
    return arr;
}

function removeDuplicateWords(str) {
    str = str.split(' ').filter(function(allItems,i,a){
        return i===a.indexOf(allItems);
    }).join(' ');
    return str;
}

function sortArrayByItsContentStringLength(arr) {
    return arr.sort(function (a,b) {
        return b.length - a.length;
    });
}

function removeDuplicateWordsFromArray(a) {
    return Array.from(new Set(a));
}

function transformResultsAndRespond(req,res,searchQuery,value) {
    if(value.length===0)
    {
        res.send({value:[],searchQueryTImeStamp: req.body.searchQueryTImeStamp});
        return;
    }
    if(searchQuery && searchQuery!=='')
        value = calculateRelevancyForEachResult(value,searchQuery);// /*calculate relevancy*/ TODO:add date as a secondary param for relevancy

    for(let i=0;i<value.length;i++){
        value[i].blogText = addEllpisis(value[i].blogText,searchQuery);
    }

    if(searchQuery && searchQuery!=='')
    value = findAndMakeSearchQueryBoldInGivenText(value,searchQuery);///*make bold*/ TODO: Do this in client side
    return value;
}

function transformSearchQuery(searchQuery) {
    searchQuery = searchQuery.replace(/\s+/g,' ').trim();
    searchQuery = removeDuplicateWords(searchQuery);
    searchQuery = sortArrayByItsContentStringLength(searchQuery.split(' ')).join(" ");
    return searchQuery;
}



module.exports = {
    assignOrderToWorkShopAdmin
    // randomString,
    // findOne,
    // createNewUser,
    // findbyID,
    // queryBuilder,
    // findAndMakeSearchQueryBoldInGivenText,
    // calculateRelevancyForEachResult,
    // addEllpisis,
    // removeDuplicateWords,
    // sortArrayByItsContentStringLength,
    // transformResultsAndRespond,
    // transformSearchQuery

};