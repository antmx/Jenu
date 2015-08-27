

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

    for (var idx = 0; idx < this.length; idx++) {
        var obj = this[idx];

        if (typeof (obj) !== t)
            throw new Error("array items must be " + t + " types but " + obj + " is a " + typeof (obj));

        if (lambda(obj))
            results.push(obj);
    }

    return results;
}

Array.prototype.AnyT = function(lambda, t) {
    if (typeof (lambda) !== "function")
        throw new Error("lambda must be a function");

    for (var idx = 0; idx < this.length; idx++) {
        var obj = this[idx];

        if (typeof (obj) !== t)
            throw new Error("array items must be " + t + " types but " + obj + " is a " + typeof (obj));

        if (lambda(obj))
            return true;
    }

    return false;
}

var a = [1, 2, 3, 4];
var b = [1, 2, 3, "foo"];

function LogArray(a) {
    for (var idx = 0; idx < a.length; idx++) {
        var num = a[idx];
        console.log(num);
    }
}

var evens = a.Where(function(i) { return i % 2 === 0; });
var odds = a.WhereT(function (i) { return i % 2 === 1; }, typeof (0));
var anyEven = a.AnyT(function(i) { return i === 10; }, typeof (0));

LogArray(evens);

LogArray(odds);

console.log(anyEven);
