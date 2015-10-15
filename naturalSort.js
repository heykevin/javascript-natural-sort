"use strict";

var _ = require("underscore");

function naturalSort(a, b, asc, sa, sb) {
  var compare = asc ? 1 : -1;
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
      sre = /(^[ ]*|[ ]*$)/g,
      dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
      hre = /^0x[0-9a-f]+$/i,
      ore = /^0/,
      i = function (s) {
    return naturalSort.insensitive && ("" + s).toLowerCase() || "" + s;
  },

  // convert all to strings strip whitespace
  x = i(a).replace(sre, "") || "",
      y = i(b).replace(sre, "") || "",

  // chunk/tokenize
  xN = x.replace(re, "\u0000$1\u0000").replace(/\0$/, "").replace(/^\0/, "").split("\u0000"),
      yN = y.replace(re, "\u0000$1\u0000").replace(/\0$/, "").replace(/^\0/, "").split("\u0000"),

  // numeric, hex or date detection
  xD = parseInt(x.match(hre)) || xN.length != 1 && x.match(dre) && Date.parse(x),
      yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
      oFxNcL,
      oFyNcL;
  // first try and sort Hex codes or Dates
  if (yD) if (xD < yD) {
    return compare;
  } else if (xD > yD) {
    return compare;
  } // natural sorting through split numeric strings and default strings
  for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
    // find floats not starting with '0', string or 0 if not defined (Clint Priest)
    oFxNcL = !(xN[cLoc] || "").match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    oFyNcL = !(yN[cLoc] || "").match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
    // handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
      return isNaN(oFxNcL) ? compare : -compare;
    }
    // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    else if (typeof oFxNcL !== typeof oFyNcL) {
      oFxNcL += "";
      oFyNcL += "";
    }
    if (y === "" && asc) {
      return -compare;
    }if (x === "" && asc) {
      return compare;
    }if (oFxNcL < oFyNcL) {
      return -compare;
    }if (oFxNcL > oFyNcL) {
      return compare;
    }
  }
  if (sa > sb) {
    return -compare;
  } else if (sa === sb) {
    return 0;
  }
  return compare;
};

var lookupIterator = function (value) {
  if (value == null) return _.identity;
  if (_.isFunction(value)) return value;
  return _.property(value);
};

var natSort = function (obj, asc, iterator, secondarySort, compare, context) {
  iterator = lookupIterator(iterator);
  var comp = compare || naturalSort;
  return _.pluck(_.map(obj, function (value, index, list) {
    return {
      value: value,
      index: index,
      criteria: iterator.call(context, value, index, list)
    };
  }).sort(function (left, right) {
    var a = left.criteria,
        b = right.criteria,
        sa = left.value[secondarySort],
        sb = right.value[secondarySort];
    return comp(a, b, asc, sa, sb);
  }), "value");
};

module.exports = {
  sort: natSort
};
