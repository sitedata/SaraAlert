class AddIndividualResponseToSymptoms < ActiveRecord::Migration[6.1]
  def change
    add_column :symptoms, :individual_response, :boolean, default: false
    add_column :symptoms, :prompt, :string
  end
end
