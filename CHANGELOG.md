# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- option for not checking silkey signature on token verification
- add `userSignatureTimestamp` to jwtPayload model
- support for `redirectMethod` param

### Changed
- change naming convention from `timestamp` to `sigTimestamp`
- change timestamp name for SSO param to `ssoTimestamp`
- `generateSSORequestParams` throws when `redirectUrl` or `cancelUrl` empty

### Fixed
- import ethers lib in a way that is supported by both: react and nodejs app

## [0.2.0] - 2020-11-04
### Added
- eslint
- Methods for signing SSO request 
- jsdocs
- new model: `JwtPayload`
- support for scope:email
- method to fetch silkey public key

### Changed
- Change package name from `silkey-jwt` to `silkey-sdk`

### Removed 
- Token generator

## [0.1.0] - 2020-10-06
### Added 
- Initial version of Silkey generator and validator for JWT
