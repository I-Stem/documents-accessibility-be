
exports.createLog = (methodName, modelName)=> {
console.log(`${methodName} ${modelName}`);
}

exports.logError = (error)=> {
console.log(error);
}