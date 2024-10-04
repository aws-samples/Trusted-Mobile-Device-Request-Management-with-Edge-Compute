const crypto = require('crypto');

function handler(event) {
    var request = event.request;
    var secret_salt = "your-random-salt"  //pre-shared secret salt

    // if Checksum is not shared with the request
    if(request.headers.checksum == undefined){
        delete request.headers['trusted']; //remove, if any added "trusted" header
        const response401 = {
                statusCode: 401,
                statusDescription: 'Unauthorized',
                body: "Unauthorised"
            };
        return response401; // return 401 error
        // return request;  // Forward request to origin without trusted header if checksum is not found
    }else{ 
        // if checksum found, test if the checksum is valid
        var headers = request.headers
        var request_checksum = headers.checksum['value']
        
        // Drop the request if it took more than 5 seconds to reach cloudfront 
        diff = headers["timestamp"]['value']-Date.now()
        if(diff > 5000){
            return request;
        }
        
        //extract important headers to calculate checksum
        //This should be the same headers that was used to create the checksum
        var header_string = {};
        header_string['user_id'] = headers["user_id"]['value'];
        header_string['user_agent'] = headers["user_agent"]['value'];
        header_string['unique_request_id'] = headers["unique_request_id"]['value'];
        header_string['timestamp'] = headers["timestamp"]['value'];
        header_string['secret_salt'] = headers["secret_salt"]["value"];
        header_string = JSON.stringify(header_string)

        //hash all the headers value to find the checksum with pre-shared salt
        var checksum=crypto.createHash('sha256').update(header_string).digest('hex');

        if(checksum == request_checksum){
            //valid request - add header to the request and return
            request.headers["trusted"] = {value:'true'};
            //console.log(request)
            return request;
        }else{
            //invalid request - Block it here or remove the checksum key and forward the request for further processing
            const response401 = {
                statusCode: 401,
                statusDescription: 'Unauthorized',
                body: "Unauthorised"
            };
            return response401;
            // else remove checksum key and forward the request to origin for WAF to process the request
            // delete request.headers['trusted'];
            // request.headers["trusted"] = {value:'false'};
            // request.headers = headers;
            // return request;
        }
    }
    return request;
}