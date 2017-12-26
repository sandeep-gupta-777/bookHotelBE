
const db = require('../db/index');

function randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
function assignOrderToWorkShopAdmin(orderObj) {
//    In real world scenerio this function needs to implemented according to nearest workshop and other criteria
    orderObj.orderAssignedTo_fullName = "Sandeep Gupta";
    orderObj.orderAssignedTo_id = "5a42112e7dfbeb1cd453f128";
    return orderObj;
}

module.exports = {
    assignOrderToWorkShopAdmin,
    randomString,
};