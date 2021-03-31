# frozen_string_literal: true

# ApplicationMailer: base mailer
class ApplicationMailer < ActionMailer::Base
  default from: ADMIN_OPTIONS['email_from_address']
  layout 'mailer'
end
