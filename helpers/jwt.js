const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.decodeJWT = (jwtString) => {
    let decodedValue = jwt.decode(jwtString, process.env.PASS_SECRET); 
    return decodedValue;
}

exports.generateJwtToken = (userId) => {
    // create a jwt token containing the id that expires in 15 minutes
    return jwt.sign({ sub: userId }, process.env.PASS_SECRET, { expiresIn: '15d' });
}

exports.generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            sub: userId, token: crypto.randomBytes(40).toString('hex')
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '365d'
        }
    );
}

exports.verifyExpiry = (token) => {
    const decoded = jwt.decode(token);

    console.log("expiry",decoded.exp)
    console.log("current",Date.now() / 1000)
    return decoded.exp < Date.now() / 1000;
}