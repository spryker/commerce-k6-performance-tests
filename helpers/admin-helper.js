export default class AdminHelper {
  getDefaultAdminEmail() {
    return __ENV.DEFAULT_ADMIN_EMAIL ? __ENV.DEFAULT_ADMIN_EMAIL : 'admin@spryker.com';
  }

  getDefaultAdminPassword() {
    return __ENV.DEFAULT_ADMIN_PASSWORD ? __ENV.DEFAULT_ADMIN_PASSWORD : 'change123';
  }
}
