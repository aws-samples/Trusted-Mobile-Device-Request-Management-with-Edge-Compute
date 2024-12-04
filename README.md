# Trusted Mobile Device Request Management with Edge Compute


This repository contains code samples for implementing secure header validation for AWS CloudFront. The primary goal is to ensure that incoming requests have a valid checksum, thereby providing a layer of security against tampered or unauthorized requests.

There are the following use case that this repository can help with
1. You want to only allow signed request from trusted devices.
2. You want to bypass WAF check for request originated from trusted devices to avoid latency added by WAF.

## Overview

The repository consists of two main files:

1. **function.js**: This script is designed to run at EDGE using AWS Cloudfront function. It validates incoming requests by checking the checksum sent with the request against a checksum generated on-the-fly using certain request headers and a pre-shared secret salt.

2. **request_checksum.js**: This script demonstrates how to generate a checksum at the source (e.g., a mobile application or server-side code) using the same headers and secret salt. The checksum is then included in the request headers to be validated by the function.js function.

## Implementation

### Pre-requisite:
1. AWS account with permission to create Cloudfront function and update Cloudfront Distribution

### Steps:
1. Create a CloudFront Function from AWS Console or CLI.
2. Copy the code from **function.js** to the Cloudfront Function.
3. Update the headers to match the one used by the source application.
4. Implement **request_checksum.js** on your mobile application/device.

## Test Implementation

### Prerequisites

1. **Node.js installed**: Ensure Node.js is installed on your local machine to generate the checksum on the client side.
   - You can download it from [here](https://nodejs.org/).
   
2. **CloudFront Function**: A valid CloudFront function set up within AWS CloudFront. This CloudFront function should be deployed to verify incoming requests and reject any unauthorized ones based on the checksum.

3. **Secret Salt**: Use the same `secret_salt` value on both the client (checksum generation) and CloudFront function for validation.

### 1. Test Checksum Generation (Client-Side)

The following steps show how to generate a checksum in a client-side environment such as a mobile application or a server:

#### Steps:

1. Copy the client-side checksum generation code (using Node.js):
   ```js
   const crypto = require('crypto');
   var secret_salt = "your-random-salt";  // Use the same salt as the one used in CloudFront

   var header = {
       "secret_salt": secret_salt,
       "user_id": "23547456456",
       "user_agent": "android",
       "unique_request_id": "1234564891256894",
       "timestamp": Date.now()
   };

   // Convert header object to a string
   header_string = JSON.stringify(header);

   // Generate the checksum using SHA-256 hashing
   var checksum = crypto.createHash('sha256').update(header_string).digest('hex');

   // Output the checksum to be used in your API request
   console.log("Generated Checksum:", checksum);
   ```

2. Modify the values for `user_id`, `user_agent`, and `unique_request_id` as needed. Keep the `secret_salt` identical to what you plan to use in the CloudFront function.

3. Run this script using Node.js:
   ```bash
   node client-checksum.js
   ```
   - The script will output a checksum that can be passed along with the request headers to CloudFront.

### 2. Test CloudFront Checksum Validation (Server-Side)

Once the client-side checksum is generated and included in the request headers, you can deploy the CloudFront function to validate the request:

#### Steps:

1. **Deploy the CloudFront function**: 
   - Copy the CloudFront function code from the above implementation.
   - Make sure you update the `secret_salt` to match what is used on the client side.
   - Deploy this function using AWS CloudFront Console under **Functions**.
   - Open your CloudFront Distribution, visit the Behaviors Tab, Edit the Behaviour and add Function Associations. Update Viewer request to function type as CloudFront Functions, and Function ARN as the function you just created above.

2. **Simulate a Request**:
   - In order to simulate a request, you can use a tool like **Postman** or a simple curl command to send an HTTP request to CloudFront.
   - Make sure the following headers are included in the request:
     - `user_id`
     - `user_agent`
     - `unique_request_id`
     - `timestamp`
     - `checksum`

3. **Test Expected Behavior**:
   - If the `checksum` matches and the request timestamp is valid (i.e., the request was sent within 5 seconds), CloudFront will add a `trusted: true` header to the request.
   - If the checksum is invalid or if the request is delayed for more than 5 seconds, CloudFront will return a `401 Unauthorized` response.

#### Example cURL Request:
To simulate an API call to CloudFront with the checksum header, you can use the following command:

```bash
curl -X GET "https://your-cloudfront-domain" \
-H "user_id: 23547456456" \
-H "user_agent: android" \
-H "unique_request_id: 1234564891256894" \
-H "timestamp: <timestamp-from-client>" \
-H "checksum: <checksum-from-client>"
```

### 3. Debugging Common Issues

- **401 Unauthorized Response**: 
   - Verify that the `secret_salt` on both the client and CloudFront match.
   - Ensure that the timestamp hasn't expired (check the 5-second window between generation and receipt).
   - Ensure the headers passed in the request match exactly the ones used for checksum generation.

- **Checksum Mismatch**: 
   - Check that the headers are correctly formatted and that no extra spaces or alterations were made when the checksum was generated.

### 4. Automated Testing (Optional)

For automated integration testing, you can create a script that simulates sending requests to your CloudFront distribution with valid and invalid checksums, validating the responses:

```bash
#!/bin/bash
# Simulate a valid request
echo "Testing with valid checksum"
curl -X GET "https://your-cloudfront-domain" \
-H "user_id: 23547456456" \
-H "user_agent: android" \
-H "unique_request_id: 1234564891256894" \
-H "timestamp: $(date +%s)" \
-H "checksum: $(node client-checksum.js)"  # Call your Node script for generating checksum
```

By following this, you can validate that the checksum mechanism works as expected on both the client and server sides.