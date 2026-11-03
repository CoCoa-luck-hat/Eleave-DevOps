const jwt = require('jsonwebtoken')

const VerifyToken = async (req, res, next) => {
    const authHead = req.headers["authorization"]
    const token = authHead && authHead.split(" ")[1]
    if (!token) {
        return res.status(401).json({
            message: 'ไม่มี Token'
        })
    }
    try {
        const decode = jwt.verify(token, process.env.TOKEN_KEY)
        req.user = decode
        req.token = token
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            message: 'Token หมดอายุ'
        })
    }
}

module.exports = { VerifyToken }