const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({});
  }
  const token = authHeader.split(' ')[1];
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    
    
    if(decode.userId === req.headers.userid){
      next();
    }
    else{
      res.json({
        message: "Error in logging in"
      })
    }
  } catch (error) {
  }
}

module.exports = {
    authMiddleware
}
