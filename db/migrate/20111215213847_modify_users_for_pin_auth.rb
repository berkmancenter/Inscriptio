class ModifyUsersForPinAuth < ActiveRecord::Migration
  def self.up
    rename_column :users, :email, :mail
    add_column :users, :guid, :string 
    add_column :users, :edupersonaffiliation, :string
  end

  def self.down
    rename_column :users, :mail, :email
    remove_column :users, :guid
    remove_column :users, :edupersonaffiliation
  end
end
