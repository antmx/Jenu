

Array.prototype.Where = function (lambda) {
    if (typeof (lambda) !== "function")
        throw new Error("lambda must be a function");

    var results = [];

    for (var idx = 0; idx < this.length; idx++) {
        var obj = this[idx];

        if (lambda(obj))
            results.push(obj);
    }

    return results;
}

Array.prototype.WhereT = function (lambda, t) {
    if (typeof (lambda) !== "function")
        throw new Error("lambda must be a function");

    var results = [];

    debugger;

    for (var idx = 0; idx < this.length; idx++) {
        var obj = this[idx];

        if (typeof (obj) !== t)
            throw new Error("array items must be " + t + " types but " + obj + " is a " + typeof (obj));

        if (lambda(obj))
            results.push(obj);
    }

    return results;
}

var a = [1, 2, 3, 4];
var b = [1, 2, 3, "foo"];

//var evens = a.Where(function(i) { return i % 2 === 0; });
//var odds = a.Where(function (i) { return i % 2 === 1; });
var odds = b.WhereT(function(i) { return i % 2 === 1; }, typeof (0));

for (var idx = 0; idx < evens.length; idx++) {
    var num = evens[idx];
    console.log(num);
}

for (var idx = 0; idx < odds.length; idx++) {
    var num = odds[idx];
    console.log(num);
}
