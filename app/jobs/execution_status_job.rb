# frozen_string_literal: true

require 'redis'
require 'redis-queue'

# ExecutionStatusJob: Pulls assessments created in the split instance and saves them
class ExecutionStatusJob < ApplicationJob
    queue_as :default
    @client = Twilio::REST::Client.new(ENV['TWILLIO_API_ACCOUNT'], ENV['TWILLIO_API_KEY'])
    JOB_TYPES = ["AssessmentMessage","AssessmentAllMessages","Single_SMS"]
    MAX_RETRY_MINUTES = 

    #  args format:
    #  {    execution_id: execution id for the execution we are checking the status of,
    #       job_type:  AssessmentMessage|AssessmentAllMessages|Single_SMS
    #       retry_delay: Time in minutes to check on status again
    #       submission_token: Submission Token for the monitoree that this execution was for
    #  }
    def perform(args)
      execution_id = args[:execution_id]
      job_type = args[:job_type]
      # Fetch execution details from Twilio
      execution = @client.studio.v1.flows(ENV['TWILLIO_STUDIO_FLOW']).executions(execution_id).fetch
      # The status of the Execution. Can be: "active" or "ended"
      execution_status = execution.status
      # For all job types except AssessmentMessage it is required that the execution be completed to check status
      if job_type != "AssessmentMessage" && execution_status != "ended"
        requeue_exponential_backoff(args)
      end

      if job_type == "AssessmentMessage"
        # Execution context will give us information about each of the widgets and outbound messages
        execution_context = @client.studio.v1.flows(ENV['TWILLIO_STUDIO_FLOW']).executions(execution_id).execution_context.fetch
        if execution_status == "ended"
            # If execution status is ended we should be able to enqueue all MessageIDs here instead of requeueing another ExecutionStatusJob with job_type AssessmentAllMessages
            enqueue_assessment_prompt_status(execution_context)
            enqueue_assessment_all_non_prompt_messages(execution_context)
        else
            # If execution status is currently active then we need to dispatch an ExecutionnStatusJob with job_type AssessmentAllMessages to check rest of messages once execution is finished
            enqueue_assessment_prompt_status(execution_context)
        end
      elsif job_type == "AssessmentAllMessages"
            # Enqueue all outbound message IDs other than the sms_assessment_prompt message
            enqueue_assessment_all_non_prompt_messages(execution_context)
      elsif job_type == "SingleSMS"
            # Enqueue all outbound message IDs
            enqueue_all_messages(execution_context)
      end

    end

    def enqueue_assessment_prompt_status(execution_context, args)
        sms_prompt_id = execution_context.context&.[]("widgets")&.[]("sms_assessment_prompt")&.[]("outbound")&.[]("Sid")
        if sms_prompt_id.nil?
            requeue_exponential_backoff(args)
        end
        # Enqueue message status job for sms_assessment_prompt
        message_job_args = {}
        message_job_args[:job_type] = args[:job_type]
        message_job_args[:message_id] = sms_prompt_id
        message_job_args[:retry_delay] = 1
        message_job_args[:sent_time] = nil
        message_job_args[:submission_token]
    end

    def enqueue_assessment_all_non_prompt_messages(execution_context)
      all_except_prompt = execution_context.context&.[]("widgets").except("sms_assessment_prompt")
      messages = all_except_prompt.values.select { |message| message if !message["outbound"].nil? }
      messages.each { |message| message["outbound"]["Sid"]}
    end

    def enqueue_all_messages(execution_context)
      messages = execution_context.context&.[]("widgets").values.select { |message| message if !message["outbound"].nil? }
    end

    def requeue_exponential_backoff(args)
      # Requeue the job usig an exponential backoff
      args[:retry_delay] = args[:retry_delay] * 2
      ExecutionStatusJob(wait: (args[:retry_delay]).minutes).perform_later(args)
    end
end