const path =require('path');

module.exports = {
    BASE_ClI_GIT_PATH     : 'git+https://github.com/u-san/usan-cli.git',
    BASE_TEMPLATE_GIT_PATH: 'git+https://github.com/u-san/usan-templates.git',
    FRAMEWORK_PATH        : path.join(__dirname, '../frame')
}