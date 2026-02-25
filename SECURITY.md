# Security Policy

## Supported Versions

The following versions of `react-native-session-timeout` are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in `react-native-session-timeout`, please **do not** open a public GitHub Issue. Instead, report it responsibly by following these steps:

1. **Email the maintainer** directly or use GitHub's [private vulnerability reporting](https://github.com/ajayi-joseph/react-native-session-timeout/security/advisories/new) feature.
2. Include the following details in your report:
   - A description of the vulnerability
   - Steps to reproduce or a proof-of-concept
   - The potential impact and affected versions
   - Any suggested mitigations (optional)

## What to Expect

- You will receive an acknowledgment within **48 hours**
- We will investigate and provide a status update within **7 days**
- If the vulnerability is confirmed, we will work on a fix and coordinate a disclosure timeline with you
- You will be credited in the release notes unless you prefer to remain anonymous

## Scope

This library handles session timeout and inactivity detection in React Native applications. Security concerns relevant to this project may include:

- Bypassing or manipulating inactivity timers
- Race conditions that prevent session expiry
- Insecure storage or handling of session state
- Vulnerabilities in timer or native bridge logic

## Out of Scope

- Vulnerabilities in React Native itself or third-party dependencies (please report those upstream)
- Issues in the example app not affecting the library

## Disclosure Policy

We follow a **coordinated disclosure** approach. Once a fix is released, details of the vulnerability will be published in the [CHANGELOG](./CHANGELOG.md) and via a GitHub Security Advisory.
