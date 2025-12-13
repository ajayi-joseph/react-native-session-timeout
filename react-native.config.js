module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.sessiontimeout.SessionTimeoutPackage;',
        packageInstance: 'new SessionTimeoutPackage()',
      },
    },
  },
};
