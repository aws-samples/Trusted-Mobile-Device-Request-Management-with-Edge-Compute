// This code needs to be incorporated at the source e.g: mobile application, server side code.
// The secret_salt should be same as mention in the cloudfront function. Secret_salt needs to be kept secret
const crypto = require('crypto');
var secret_salt = "your-random-salt"

var header = {
    "secret_salt": secret_salt,
    "user_id":"23547456456" ,
    "user_agent":"android",
    "unique_request_id":"1234564891256894",
    "timestamp": Date.now()
}
// console.log(header);
header_string = JSON.stringify(header)

// console.log(header_string);
var checksum=crypto.createHash('sha256').update(header_string).digest('hex');
console.log(checksum)