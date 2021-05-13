class AddHeadOfHouseholdToPatient < ActiveRecord::Migration[6.0]
  def up
    add_column :patients, :head_of_household, :boolean, null: true, default: false

    execute <<-SQL.squish
      UPDATE patients
      INNER JOIN (
        SELECT responder_id AS patient_id, COUNT(responder_id) AS household_members
        FROM patients
        WHERE purged = FALSE
        GROUP BY responder_id
      ) t on patients.id = t.patient_id
      SET patients.head_of_household = IF(t.household_members > 1, TRUE, FALSE)
      AND purged = FALSE
    SQL
  end

  def down
    remove_column :patients, :head_of_household, :boolean, null: true
  end
end
