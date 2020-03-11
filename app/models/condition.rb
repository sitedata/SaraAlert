class Condition < ApplicationRecord
    has_many :symptoms

    def self.build_symptoms(symptoms_array)
        typed_symptoms = []

        symptoms_array.each { |symp|
            symptom = Symptom.new(symp)
            typed_symptoms.push(symptom)
        }
        return typed_symptoms
    end
end
