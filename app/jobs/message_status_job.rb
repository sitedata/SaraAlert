# frozen_string_literal: true

require 'redis'
require 'redis-queue'

# MessageStatusJob: Pulls assessments created in the split instance and saves them
class MessageStatusJob < ApplicationJob
    queue_as :default
    @client = Twilio::REST::Client.new(ENV['TWILLIO_API_ACCOUNT'], ENV['TWILLIO_API_KEY'])

    #  args format:
    #  {    message_id: message id for the message we are checking the status of,
    #       job_type:  AssessmentMessage|AssessmentAllMessages|SingleSMS
    #       retry_delay: Time in minutes to check on status again
    #       sent_time:  Time when we first saw "sent" status
    #       submission_token: Patient's submission token
    #  }
    def perform(args)
      message_id = args[:message_id]
      job_type = args[:job_type]
      sent_time = args[:sent_time]

      # Fetch message details from Twilio
      message = @client.messages(message_id).fetch
      # The status of the Message. Can be: accepted, queued, sending, sent, failed, delivered, undelivered
      message_status = message.status


      # Twilio cannot guarentee that a carrier will send them a message delivery receipt
      # If a message is in "sent" status for over an hour, we will assume the message was
      # successfuly delivered.
      if message_status == "sent"
        if sent_time.nil?
            args[:sent_time] = Time.now
            requeue_exponential_backoff(args)
            return
        end
      end

      # Requeue message status job if ultimate message status is still unknown
      if ["accepted", "queued", "sending"]
        requeue_exponential_backoff(args)
        return
      end

      # If message failed to send, distribute error message accordingly
      if ["failed", "undelivered"].include? message_status
        # Handle failure
      end

    end

    def requeue_exponential_backoff(args)
      # Requeue the job usig an exponential backoff
      args[:retry_delay] = args[:retry_delay] * 2
      ExecutionStatusJob(wait: (args[:retry_delay]).minutes).perform_later(args)
    end
end