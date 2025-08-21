BigInt.prototype.toJSON = function () {
  return this.toString(); // or Number(this) if you want integers
};
