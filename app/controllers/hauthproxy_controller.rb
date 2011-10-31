class HauthproxyController < ApplicationController
 
  before_filter :authenticate_user!, :except => [:validate, :invalid]

  def validate
  end

  def invalid
  end
end
