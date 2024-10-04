# Secure Header Validation for CloudFront

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
```
node request_checksum.js
```