# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-13

### Added
- Initial release
- Session timeout functionality with configurable duration
- Built-in warning dialog support with countdown
- Android 10+ compatibility with proper lifecycle handling
- iOS support with native timer implementation
- TypeScript support with full type definitions
- Automatic app lifecycle management (background/foreground)
- User activity tracking via touch events
- Pause/resume timer functionality
- Custom event tracking support
- Hook-based API (`useSessionTimeout`)
- Provider component (`SessionTimeoutProvider`)
- Zero native linking required (autolinking support)

### Features
- No external dependencies for background timers
- Accurate timekeeping using native modules
- Proper Android Handler and iOS Timer implementations
- Lifecycle event listeners for both platforms
- Customizable timeout and warning durations
- Callback functions for timeout and warning events
