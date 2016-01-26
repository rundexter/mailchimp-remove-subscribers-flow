var request = require('request'),
    _ = require('lodash'),
    util = require('./util'),
    pickInputs = {
        workflow_id: { key: 'workflow_id', validate: { req: true } },
        workflow_email_id: { key: 'workflow_email_id', validate: { req: true } },
        email_address: { key: 'email_address', validate: { req: true } }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var accessToken = dexter.provider('mailchimp').credentials('access_token'),
            server = dexter.environment('mailchimp_server'),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (!server)
            return this.fail('A [mailchimp_server] environment need for this module.');

        if (validateErrors)
            return this.fail(validateErrors);

        request({
            method: 'POST',
            baseUrl: 'https://' + server + '.api.mailchimp.com/3.0/',
            uri: '/automations/' + inputs.workflow_id + '/removed-subscribers',
            body: _.pick(inputs, 'email_address'),
            json: true,
            auth: {
                bearer: accessToken
            }
        },
        function (error, response, body) {
            if (!error && (response.statusCode === 200 || response.statusCode === 204)) {
                this.complete({});
            } else {
                this.fail(error || body);
            }
        }.bind(this));
    }
};
