require 'spec_helper'

describe HauthproxyController do

  describe "GET 'validate'" do
    it "should be successful" do
      get 'validate'
      response.should be_success
    end
  end

  describe "GET 'invalid'" do
    it "should be successful" do
      get 'invalid'
      response.should be_success
    end
  end

end
